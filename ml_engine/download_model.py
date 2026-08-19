"""
Model Downloader & Verifier Utility
Ensures the 345MB EfficientNet-B5 FER model is present locally or downloads it from cloud storage.
"""

import os
import sys
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "best_efficientnet_b5_faces_fer4.pth")

# Cloud mirror URLs (User can configure GitHub Release or Hugging Face repository URL)
MODEL_MIRRORS = [
    # Optional mirror URLs
    # "https://github.com/<user>/<repo>/releases/download/v2.0.0/best_efficientnet_b5_faces_fer4.pth",
    # "https://huggingface.co/<user>/<repo>/resolve/main/best_efficientnet_b5_faces_fer4.pth"
]

def download_progress(block_num, block_size, total_size):
    downloaded = block_num * block_size
    if total_size > 0:
        percent = min(100.0, downloaded * 100 / total_size)
        mb_down = downloaded / (1024 * 1024)
        mb_total = total_size / (1024 * 1024)
        sys.stdout.write(f"\rDownloading: {mb_down:.1f}/{mb_total:.1f} MB ({percent:.1f}%)")
        sys.stdout.flush()

def ensure_model_weights(target_path=DEFAULT_MODEL_PATH, custom_url=None):
    if os.path.isfile(target_path) and os.path.getsize(target_path) > 100 * 1024 * 1024:
        print(f"[✓] EfficientNet-B5 weights already present ({os.path.getsize(target_path) / (1024**2):.1f} MB) at {target_path}")
        return True

    urls_to_try = []
    if custom_url:
        urls_to_try.append(custom_url)
    urls_to_try.extend(MODEL_MIRRORS)

    if not urls_to_try:
        print(f"[!] Checkpoint not found at: {target_path}")
        print("[i] Since the model weights are 345 MB, ensure 'best_efficientnet_b5_faces_fer4.pth' is placed in ml_engine/.")
        print("[i] Alternatively, provide a direct download URL using --url <model_url>.")
        return False

    for url in urls_to_try:
        try:
            print(f"[*] Fetching weights from {url} ...")
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            urllib.request.urlretrieve(url, target_path, reporthook=download_progress)
            print(f"\n[✓] Successfully downloaded model weights to {target_path}")
            return True
        except Exception as e:
            print(f"\n[!] Failed to download from {url}: {e}")

    return False

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Ensure or download model weights")
    parser.add_argument("--url", type=str, default=None, help="Custom download URL")
    parser.add_argument("--output", type=str, default=DEFAULT_MODEL_PATH, help="Target file path")
    args = parser.parse_args()

    ensure_model_weights(args.output, args.url)
