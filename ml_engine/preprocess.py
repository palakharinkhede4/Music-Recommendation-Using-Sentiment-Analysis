"""
Face Detection and Dataset Preprocessing Pipeline
Extracts, aligns, and crops facial regions from raw training and validation images
using OpenCV Haar Cascades with safety fallbacks and padding.
"""

import os
import cv2
import json
import time
import shutil
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# =========================================================
# Config Defaults
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DEFAULT_TRAIN_DIR = os.path.join(BASE_DIR, "train")
DEFAULT_VAL_DIR = os.path.join(BASE_DIR, "validation")

DEFAULT_OUT_TRAIN_DIR = os.path.join(BASE_DIR, "train_faces")
DEFAULT_OUT_VAL_DIR = os.path.join(BASE_DIR, "validation_faces")

PREPROCESS_REPORT_PATH = os.path.join(BASE_DIR, "preprocess_report.json")

# Haar cascade file resolution (local file or opencv builtin)
LOCAL_CASCADE = os.path.join(BASE_DIR, "haarcascade_frontalface_default.xml")
if os.path.isfile(LOCAL_CASCADE):
    CASCADE_PATH = LOCAL_CASCADE
elif hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
    CASCADE_PATH = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
else:
    CASCADE_PATH = LOCAL_CASCADE

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
NUM_WORKERS = min(16, os.cpu_count() if os.cpu_count() else 8)

# Detection / crop settings
SCALE_FACTOR = 1.1
MIN_NEIGHBORS = 4
MIN_FACE_RATIO = 0.08
PADDING_RATIO = 0.20
FALLBACK_COPY_IF_NO_FACE = True
OVERWRITE_OUTPUT = True

# =========================================================
# Logging
# =========================================================
def log(msg=""):
    print(msg, flush=True)

# =========================================================
# Init detector
# =========================================================
def load_face_cascade(cascade_path=CASCADE_PATH):
    if not os.path.isfile(cascade_path):
        if hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
            builtin_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
            if os.path.isfile(builtin_path):
                cascade_path = builtin_path
    
    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        raise RuntimeError(f"Failed to load Haar cascade from: {cascade_path}")
    return cascade, cascade_path

# =========================================================
# Helpers
# =========================================================
def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def list_images(root_dir):
    files = []
    root = Path(root_dir)
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS:
            files.append(str(p))
    return files

def clip_box(x1, y1, x2, y2, w, h):
    x1 = max(0, min(int(round(x1)), w - 1))
    y1 = max(0, min(int(round(y1)), h - 1))
    x2 = max(1, min(int(round(x2)), w))
    y2 = max(1, min(int(round(y2)), h))
    if x2 <= x1:
        x2 = min(w, x1 + 1)
    if y2 <= y1:
        y2 = min(h, y1 + 1)
    return x1, y1, x2, y2

def expand_box(x, y, w, h, img_w, img_h, pad_ratio):
    pad_w = w * pad_ratio
    pad_h = h * pad_ratio

    x1 = x - pad_w
    y1 = y - pad_h
    x2 = x + w + pad_w
    y2 = y + h + pad_h

    return clip_box(x1, y1, x2, y2, img_w, img_h)

def select_largest_face(faces):
    if len(faces) == 0:
        return None
    return max(faces, key=lambda f: f[2] * f[3])

# =========================================================
# Core image processing
# =========================================================
def process_one_image(src_path, input_root, output_root, face_cascade):
    try:
        rel_path = os.path.relpath(src_path, input_root)
        dst_path = os.path.join(output_root, rel_path)
        ensure_dir(os.path.dirname(dst_path))

        if os.path.exists(dst_path) and not OVERWRITE_OUTPUT:
            return {
                "src": src_path,
                "dst": dst_path,
                "status": "skipped_exists"
            }

        img = cv2.imread(src_path)
        if img is None:
            return {
                "src": src_path,
                "dst": dst_path,
                "status": "failed_read"
            }

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        min_size = (
            max(16, int(w * MIN_FACE_RATIO)),
            max(16, int(h * MIN_FACE_RATIO))
        )

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=SCALE_FACTOR,
            minNeighbors=MIN_NEIGHBORS,
            minSize=min_size
        )

        if len(faces) == 0:
            if FALLBACK_COPY_IF_NO_FACE:
                shutil.copy2(src_path, dst_path)
                return {
                    "src": src_path,
                    "dst": dst_path,
                    "status": "copied_no_face",
                    "orig_size": [w, h]
                }
            return {
                "src": src_path,
                "dst": dst_path,
                "status": "no_face"
            }

        x, y, fw, fh = select_largest_face(faces)

        x1, y1, x2, y2 = expand_box(
            x, y, fw, fh,
            w, h,
            PADDING_RATIO
        )

        crop = img[y1:y2, x1:x2]
        if crop.size == 0:
            if FALLBACK_COPY_IF_NO_FACE:
                shutil.copy2(src_path, dst_path)
                return {
                    "src": src_path,
                    "dst": dst_path,
                    "status": "copied_empty_crop_fallback",
                    "orig_size": [w, h]
                }
            return {
                "src": src_path,
                "dst": dst_path,
                "status": "empty_crop"
            }

        success = cv2.imwrite(dst_path, crop)
        if not success:
            return {
                "src": src_path,
                "dst": dst_path,
                "status": "failed_write"
            }

        return {
            "src": src_path,
            "dst": dst_path,
            "status": "ok",
            "orig_size": [w, h],
            "crop_size": [int(x2 - x1), int(y2 - y1)]
        }

    except Exception as e:
        return {
            "src": src_path,
            "dst": None,
            "status": "exception",
            "reason": str(e)
        }

# =========================================================
# Dataset processing
# =========================================================
def process_dataset(input_root, output_root, face_cascade, num_workers=NUM_WORKERS):
    ensure_dir(output_root)
    image_paths = list_images(input_root)
    total = len(image_paths)

    log("=========================================================")
    log(f"Processing input:  {input_root}")
    log(f"Writing output:    {output_root}")
    log(f"Images found:      {total}")
    log(f"Workers:           {num_workers}")
    log("=========================================================")

    if total == 0:
        log(f"No images found in {input_root}. Skipping.")
        return {"input_root": input_root, "output_root": output_root, "total": 0, "ok": 0}

    results = []
    start = time.time()

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = {
            executor.submit(process_one_image, img_path, input_root, output_root, face_cascade): img_path
            for img_path in image_paths
        }

        completed = 0
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            completed += 1

            if completed % 100 == 0 or completed == total:
                ok_count = sum(1 for r in results if r["status"] == "ok")
                copied_count = sum(1 for r in results if "copied" in r["status"])
                no_face_count = sum(1 for r in results if r["status"] == "no_face")
                fail_count = sum(
                    1 for r in results
                    if r["status"] in {"failed_read", "empty_crop", "failed_write", "exception"}
                )

                elapsed = time.time() - start
                rate = completed / elapsed if elapsed > 0 else 0.0

                log(
                    f"[{os.path.basename(input_root)}] "
                    f"{completed}/{total} | ok={ok_count} | copied={copied_count} | "
                    f"no_face={no_face_count} | fail={fail_count} | {rate:.1f} img/s"
                )

    elapsed = time.time() - start

    summary = {
        "input_root": input_root,
        "output_root": output_root,
        "total": total,
        "ok": sum(1 for r in results if r["status"] == "ok"),
        "copied_no_face": sum(1 for r in results if r["status"] == "copied_no_face"),
        "copied_empty_crop_fallback": sum(1 for r in results if r["status"] == "copied_empty_crop_fallback"),
        "no_face": sum(1 for r in results if r["status"] == "no_face"),
        "failed_read": sum(1 for r in results if r["status"] == "failed_read"),
        "empty_crop": sum(1 for r in results if r["status"] == "empty_crop"),
        "failed_write": sum(1 for r in results if r["status"] == "failed_write"),
        "exception": sum(1 for r in results if r["status"] == "exception"),
        "elapsed_sec": elapsed,
        "images_per_sec": total / elapsed if elapsed > 0 else 0.0
    }

    log("=========================================================")
    log(json.dumps(summary, indent=2))
    log("=========================================================")

    return summary

# =========================================================
# Main CLI
# =========================================================
def main():
    parser = argparse.ArgumentParser(description="Crop and preprocess face dataset for FER")
    parser.add_argument("--train_in", type=str, default=DEFAULT_TRAIN_DIR, help="Raw train images folder")
    parser.add_argument("--val_in", type=str, default=DEFAULT_VAL_DIR, help="Raw val images folder")
    parser.add_argument("--train_out", type=str, default=DEFAULT_OUT_TRAIN_DIR, help="Output cropped train faces")
    parser.add_argument("--val_out", type=str, default=DEFAULT_OUT_VAL_DIR, help="Output cropped val faces")
    parser.add_argument("--cascade", type=str, default=CASCADE_PATH, help="Path to Haar cascade xml")
    parser.add_argument("--workers", type=int, default=NUM_WORKERS, help="Number of worker threads")
    args = parser.parse_args()

    face_cascade, resolved_cascade_path = load_face_cascade(args.cascade)
    log(f"Using Haar cascade from: {resolved_cascade_path}")

    train_summary = None
    val_summary = None

    if os.path.isdir(args.train_in):
        train_summary = process_dataset(args.train_in, args.train_out, face_cascade, args.workers)
    else:
        log(f"Train directory not found: {args.train_in}")

    if os.path.isdir(args.val_in):
        val_summary = process_dataset(args.val_in, args.val_out, face_cascade, args.workers)
    else:
        log(f"Validation directory not found: {args.val_in}")

    report = {
        "config": {
            "cascade_path": resolved_cascade_path,
            "scale_factor": SCALE_FACTOR,
            "min_neighbors": MIN_NEIGHBORS,
            "min_face_ratio": MIN_FACE_RATIO,
            "padding_ratio": PADDING_RATIO,
            "fallback_copy_if_no_face": FALLBACK_COPY_IF_NO_FACE,
            "overwrite_output": OVERWRITE_OUTPUT,
            "num_workers": args.workers
        },
        "train_summary": train_summary,
        "val_summary": val_summary
    }

    with open(PREPROCESS_REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)

    log(f"Saved preprocess report to: {PREPROCESS_REPORT_PATH}")
    log("Preprocessing complete.")

if __name__ == "__main__":
    main()
