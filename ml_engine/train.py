"""
EfficientNet-B5 Facial Emotion Recognition (FER) 4-Class Training Pipeline
Framework: PyTorch
Backbone: Pretrained EfficientNet-B5 Fine-Tuned in 3 Progressive Stages
Classes (4): angry, happy, neutral, sad
"""

import os
import copy
import json
import time
import random
import warnings
import argparse
from collections import Counter

import numpy as np
from PIL import ImageOps

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import confusion_matrix, classification_report, balanced_accuracy_score

warnings.filterwarnings("ignore", category=UserWarning)

# =========================================================
# Reproducibility / Performance
# =========================================================
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)
    torch.backends.cudnn.benchmark = True
    torch.set_float32_matmul_precision("high")

# =========================================================
# Paths / Config Defaults
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TRAIN_DIR = os.path.join(BASE_DIR, "train_faces")
VAL_DIR = os.path.join(BASE_DIR, "validation_faces")
WEIGHTS_PATH = os.path.join(BASE_DIR, "efficientnet_b5_lukemelas-1a07897c.pth")

BEST_PATH = os.path.join(BASE_DIR, "best_efficientnet_b5_faces_fer4.pth")
LAST_PATH = os.path.join(BASE_DIR, "last_efficientnet_b5_faces_fer4.pth")
CLASSMAP_PATH = os.path.join(BASE_DIR, "class_to_idx_faces.json")
VAL_REPORT_PATH = os.path.join(BASE_DIR, "validation_faces_report.txt")
TRAIN_CONFUSION_PATH = os.path.join(BASE_DIR, "train_faces_confusion_matrix.json")
VAL_CONFUSION_PATH = os.path.join(BASE_DIR, "validation_faces_confusion_matrix.json")

NUM_CLASSES = 4
IMAGE_SIZE = 456
BATCH_SIZE = 64
NUM_WORKERS = min(12, os.cpu_count() if os.cpu_count() else 8)

EPOCHS_STAGE1 = 6
EPOCHS_STAGE2 = 10
EPOCHS_STAGE3 = 24
TOTAL_EPOCHS = EPOCHS_STAGE1 + EPOCHS_STAGE2 + EPOCHS_STAGE3

LR_STAGE1 = 1e-3
LR_STAGE2 = 3e-4
LR_STAGE3 = 1e-4

WEIGHT_DECAY = 1e-4
LABEL_SMOOTHING = 0.03
EARLY_STOPPING_PATIENCE = 8

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
USE_AMP = torch.cuda.is_available()

EXPECTED_CLASSES = {"angry", "happy", "sad", "neutral"}

# =========================================================
# Logging
# =========================================================
def log(msg=""):
    print(msg, flush=True)

def fmt_time(seconds):
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"

def gpu_stats():
    if not torch.cuda.is_available():
        return "GPU: N/A"
    allocated = torch.cuda.memory_allocated() / (1024 ** 3)
    reserved = torch.cuda.memory_reserved() / (1024 ** 3)
    max_alloc = torch.cuda.max_memory_allocated() / (1024 ** 3)
    return f"GPU allocated={allocated:.2f}GB reserved={reserved:.2f}GB max={max_alloc:.2f}GB"

# =========================================================
# Preprocessing transforms
# =========================================================
class AutoContrastPIL:
    def __call__(self, img):
        return ImageOps.autocontrast(img)

# FER-friendly transforms:
train_transform = transforms.Compose([
    AutoContrastPIL(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomAffine(
        degrees=6,
        translate=(0.02, 0.02),
        scale=(0.98, 1.02),
        shear=2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

val_transform = transforms.Compose([
    AutoContrastPIL(),
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# =========================================================
# Build Model Function
# =========================================================
def build_model(num_classes=NUM_CLASSES, weights_path=None, pretrained=True):
    """
    Builds the EfficientNet-B5 architecture with the custom classifier head.
    Can load torchvision default weights or custom pretrained checkpoint.
    """
    if pretrained and weights_path and os.path.isfile(weights_path):
        model = models.efficientnet_b5(weights=None)
        ckpt = torch.load(weights_path, map_location="cpu")
        if isinstance(ckpt, dict) and "state_dict" in ckpt:
            state_dict = ckpt["state_dict"]
        elif isinstance(ckpt, dict) and "model_state_dict" in ckpt:
            state_dict = ckpt["model_state_dict"]
        else:
            state_dict = ckpt

        clean_state_dict = {}
        for k, v in state_dict.items():
            nk = k.replace("module.", "") if k.startswith("module.") else k
            clean_state_dict[nk] = v

        model.load_state_dict(clean_state_dict, strict=False)
    elif pretrained:
        try:
            weights = models.EfficientNet_B5_Weights.DEFAULT
            model = models.efficientnet_b5(weights=weights)
        except Exception:
            model = models.efficientnet_b5(weights=None)
    else:
        model = models.efficientnet_b5(weights=None)

    # Replace head with custom non-inplace classifier
    in_features = model.classifier[-1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.25),
        nn.Linear(512, num_classes)
    )

    return model

# =========================================================
# Freeze / unfreeze helpers
# =========================================================
def freeze_all_backbone(model_obj):
    for p in model_obj.features.parameters():
        p.requires_grad = False
    for p in model_obj.classifier.parameters():
        p.requires_grad = True

def unfreeze_last_blocks(model_obj, num_blocks=4):
    for p in model_obj.features.parameters():
        p.requires_grad = False
    for p in model_obj.classifier.parameters():
        p.requires_grad = True

    total_blocks = len(model_obj.features)
    start = max(0, total_blocks - num_blocks)
    for i in range(start, total_blocks):
        for p in model_obj.features[i].parameters():
            p.requires_grad = True

def unfreeze_all(model_obj):
    for p in model_obj.parameters():
        p.requires_grad = True

def count_params(model_obj):
    total = sum(p.numel() for p in model_obj.parameters())
    trainable = sum(p.numel() for p in model_obj.parameters() if p.requires_grad)
    return total, trainable

# =========================================================
# Helpers
# =========================================================
def save_confusion(cm, class_names, path):
    with open(path, "w") as f:
        json.dump({
            "labels": class_names,
            "confusion_matrix": cm.tolist()
        }, f, indent=2)

def save_checkpoint(path, model_obj, optimizer, scheduler, epoch, best_acc, stage_name, class_to_idx):
    torch.save({
        "epoch": epoch,
        "model_state_dict": model_obj.state_dict(),
        "optimizer_state_dict": optimizer.state_dict() if optimizer else None,
        "scheduler_state_dict": scheduler.state_dict() if scheduler else None,
        "best_acc": best_acc,
        "stage_name": stage_name,
        "class_to_idx": class_to_idx
    }, path)

def train_one_epoch(model_obj, loader, optimizer, criterion, scaler, epoch, total_epochs, stage_name, device):
    model_obj.train()

    running_loss = 0.0
    running_corrects = 0
    all_preds = []
    all_labels = []

    phase_start = time.time()

    for batch_idx, (inputs, labels) in enumerate(loader, start=1):
        inputs = inputs.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)

        with torch.autocast(device_type="cuda" if device.type == "cuda" else "cpu", dtype=torch.float16, enabled=USE_AMP):
            outputs = model_obj(inputs)
            loss = criterion(outputs, labels)
            preds = outputs.argmax(dim=1)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        bs = inputs.size(0)
        running_loss += loss.item() * bs
        running_corrects += (preds == labels).sum().item()

        all_preds.extend(preds.detach().cpu().numpy().tolist())
        all_labels.extend(labels.detach().cpu().numpy().tolist())

        if batch_idx % 10 == 0 or batch_idx == 1 or batch_idx == len(loader):
            seen = min(batch_idx * loader.batch_size, len(loader.dataset))
            cur_loss = running_loss / seen
            cur_acc = running_corrects / seen
            elapsed = time.time() - phase_start
            ips = seen / elapsed if elapsed > 0 else 0.0

            log(
                f"[{stage_name}] TRAIN Epoch {epoch}/{total_epochs} | "
                f"Batch {batch_idx:>4}/{len(loader):<4} | "
                f"Seen {seen:>6}/{len(loader.dataset):<6} | "
                f"Loss {cur_loss:.4f} | Acc {cur_acc:.4f} | "
                f"{ips:.1f} img/s | {gpu_stats()}"
            )

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = running_corrects / len(loader.dataset)
    bal_acc = balanced_accuracy_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)

    log(
        f"[{stage_name}] TRAIN DONE | Loss {epoch_loss:.4f} | "
        f"Acc {epoch_acc:.4f} | Balanced Acc {bal_acc:.4f} | "
        f"Time {fmt_time(time.time() - phase_start)}"
    )

    return epoch_loss, epoch_acc, bal_acc, cm

@torch.no_grad()
def eval_one_epoch(model_obj, loader, criterion, stage_name, device):
    model_obj.eval()

    running_loss = 0.0
    running_corrects = 0
    all_preds = []
    all_labels = []

    phase_start = time.time()

    for batch_idx, (inputs, labels) in enumerate(loader, start=1):
        inputs = inputs.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        with torch.autocast(device_type="cuda" if device.type == "cuda" else "cpu", dtype=torch.float16, enabled=USE_AMP):
            outputs = model_obj(inputs)
            loss = criterion(outputs, labels)
            preds = outputs.argmax(dim=1)

        bs = inputs.size(0)
        running_loss += loss.item() * bs
        running_corrects += (preds == labels).sum().item()

        all_preds.extend(preds.detach().cpu().numpy().tolist())
        all_labels.extend(labels.detach().cpu().numpy().tolist())

        if batch_idx % 10 == 0 or batch_idx == len(loader):
            seen = min(batch_idx * loader.batch_size, len(loader.dataset))
            log(
                f"[{stage_name}] VAL   Batch {batch_idx:>4}/{len(loader):<4} | "
                f"Seen {seen:>6}/{len(loader.dataset):<6} | {gpu_stats()}"
            )

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = running_corrects / len(loader.dataset)
    bal_acc = balanced_accuracy_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)

    log(
        f"[{stage_name}] VAL DONE | Loss {epoch_loss:.4f} | "
        f"Acc {epoch_acc:.4f} | Balanced Acc {bal_acc:.4f} | "
        f"Time {fmt_time(time.time() - phase_start)}"
    )

    return epoch_loss, epoch_acc, bal_acc, cm, all_labels, all_preds

def run_stage(model_obj, stage_name, epochs, optimizer, scheduler, criterion, scaler,
              train_loader, val_loader, val_dataset, class_to_idx,
              global_epoch_start, patience, device, best_path, last_path):
    best_acc = -1.0
    best_state = copy.deepcopy(model_obj.state_dict())
    no_improve = 0

    for local_epoch in range(1, epochs + 1):
        global_epoch = global_epoch_start + local_epoch - 1

        log("")
        log("=========================================================")
        log(f"Stage {stage_name} | Local Epoch {local_epoch}/{epochs} | Global Epoch {global_epoch}/{TOTAL_EPOCHS}")
        log("=========================================================")

        train_loss, train_acc, train_bal_acc, train_cm = train_one_epoch(
            model_obj=model_obj,
            loader=train_loader,
            optimizer=optimizer,
            criterion=criterion,
            scaler=scaler,
            epoch=local_epoch,
            total_epochs=epochs,
            stage_name=stage_name,
            device=device
        )

        val_loss, val_acc, val_bal_acc, val_cm, val_labels, val_preds = eval_one_epoch(
            model_obj=model_obj,
            loader=val_loader,
            criterion=criterion,
            stage_name=stage_name,
            device=device
        )

        scheduler.step(val_loss)

        log(f"[{stage_name}] LR now: {optimizer.param_groups[0]['lr']:.8f}")
        log(f"[{stage_name}] Train CM:\n{train_cm}")
        log(f"[{stage_name}] Val CM:\n{val_cm}")

        save_confusion(train_cm, list(class_to_idx.keys()), TRAIN_CONFUSION_PATH)
        save_confusion(val_cm, val_dataset.classes, VAL_CONFUSION_PATH)

        save_checkpoint(
            last_path,
            model_obj,
            optimizer,
            scheduler,
            global_epoch,
            best_acc,
            stage_name,
            class_to_idx
        )

        if val_acc > best_acc:
            best_acc = val_acc
            best_state = copy.deepcopy(model_obj.state_dict())
            no_improve = 0

            save_checkpoint(
                best_path,
                model_obj,
                optimizer,
                scheduler,
                global_epoch,
                best_acc,
                stage_name,
                class_to_idx
            )

            report = classification_report(
                val_labels,
                val_preds,
                target_names=val_dataset.classes,
                digits=4
            )
            with open(VAL_REPORT_PATH, "w") as f:
                f.write(report)

            log(f"[{stage_name}] New best val acc: {best_acc:.4f}")
            log(f"[{stage_name}] Best checkpoint saved to: {best_path}")
        else:
            no_improve += 1
            log(f"[{stage_name}] No improvement. Patience {no_improve}/{patience}")

        if no_improve >= patience:
            log(f"[{stage_name}] Early stopping triggered.")
            break

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    model_obj.load_state_dict(best_state)
    return model_obj, best_acc, global_epoch_start + local_epoch

# =========================================================
# Main Training Routine
# =========================================================
def main():
    parser = argparse.ArgumentParser(description="Train EfficientNet-B5 FER Model")
    parser.add_argument("--train_dir", type=str, default=TRAIN_DIR, help="Path to cropped train faces")
    parser.add_argument("--val_dir", type=str, default=VAL_DIR, help="Path to cropped validation faces")
    parser.add_argument("--weights_path", type=str, default=WEIGHTS_PATH, help="Pretrained EfficientNet-B5 weights")
    parser.add_argument("--best_path", type=str, default=BEST_PATH, help="Path to save best checkpoint")
    parser.add_argument("--last_path", type=str, default=LAST_PATH, help="Path to save last checkpoint")
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE, help="Batch size")
    parser.add_argument("--workers", type=int, default=NUM_WORKERS, help="DataLoader workers")
    args = parser.parse_args()

    if not os.path.isdir(args.train_dir) or not os.path.isdir(args.val_dir):
        log(f"Dataset directories not found ({args.train_dir} / {args.val_dir}).")
        log("Run preprocess.py first or specify valid dataset directories.")
        return

    log("=========================================================")
    log("Loading cropped-face datasets...")
    train_dataset = datasets.ImageFolder(args.train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(args.val_dir, transform=val_transform)

    log(f"Train classes: {train_dataset.classes}")
    log(f"Val classes:   {val_dataset.classes}")
    log(f"Class to idx:  {train_dataset.class_to_idx}")

    with open(CLASSMAP_PATH, "w") as f:
        json.dump(train_dataset.class_to_idx, f, indent=2)

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.workers,
        pin_memory=True if torch.cuda.is_available() else False
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.workers,
        pin_memory=True if torch.cuda.is_available() else False
    )

    # Class-weighted Cross Entropy
    train_targets = [label for _, label in train_dataset.samples]
    class_counts = Counter(train_targets)
    class_weights = [len(train_targets) / (NUM_CLASSES * class_counts[idx]) for idx in range(NUM_CLASSES)]
    class_weights_t = torch.tensor(class_weights, dtype=torch.float32, device=DEVICE)

    # Model
    model = build_model(num_classes=NUM_CLASSES, weights_path=args.weights_path).to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_weights_t, label_smoothing=LABEL_SMOOTHING)
    scaler = torch.cuda.amp.GradScaler(enabled=USE_AMP)

    # Stage 1 - Head
    log("\nSTAGE 1: Train Head Only")
    freeze_all_backbone(model)
    optimizer1 = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_STAGE1, weight_decay=WEIGHT_DECAY)
    scheduler1 = ReduceLROnPlateau(optimizer1, mode="min", factor=0.5, patience=2, min_lr=1e-6)

    model, best1, next_epoch = run_stage(
        model_obj=model, stage_name="stage1_head", epochs=EPOCHS_STAGE1,
        optimizer=optimizer1, scheduler=scheduler1, criterion=criterion, scaler=scaler,
        train_loader=train_loader, val_loader=val_loader, val_dataset=val_dataset,
        class_to_idx=train_dataset.class_to_idx, global_epoch_start=1, patience=4,
        device=DEVICE, best_path=args.best_path, last_path=args.last_path
    )

    # Stage 2 - Last blocks
    log("\nSTAGE 2: Unfreeze Last Blocks")
    unfreeze_last_blocks(model, num_blocks=4)
    optimizer2 = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_STAGE2, weight_decay=WEIGHT_DECAY)
    scheduler2 = ReduceLROnPlateau(optimizer2, mode="min", factor=0.5, patience=2, min_lr=1e-6)

    model, best2, next_epoch = run_stage(
        model_obj=model, stage_name="stage2_last_blocks", epochs=EPOCHS_STAGE2,
        optimizer=optimizer2, scheduler=scheduler2, criterion=criterion, scaler=scaler,
        train_loader=train_loader, val_loader=val_loader, val_dataset=val_dataset,
        class_to_idx=train_dataset.class_to_idx, global_epoch_start=next_epoch, patience=5,
        device=DEVICE, best_path=args.best_path, last_path=args.last_path
    )

    # Stage 3 - Full Fine-Tuning
    log("\nSTAGE 3: Full Fine-Tuning")
    unfreeze_all(model)
    optimizer3 = optim.AdamW(model.parameters(), lr=LR_STAGE3, weight_decay=WEIGHT_DECAY)
    scheduler3 = ReduceLROnPlateau(optimizer3, mode="min", factor=0.5, patience=2, min_lr=1e-6)

    model, best3, next_epoch = run_stage(
        model_obj=model, stage_name="stage3_full", epochs=EPOCHS_STAGE3,
        optimizer=optimizer3, scheduler=scheduler3, criterion=criterion, scaler=scaler,
        train_loader=train_loader, val_loader=val_loader, val_dataset=val_dataset,
        class_to_idx=train_dataset.class_to_idx, global_epoch_start=next_epoch, patience=EARLY_STOPPING_PATIENCE,
        device=DEVICE, best_path=args.best_path, last_path=args.last_path
    )

    log(f"\nTraining Complete! Best Stage 1: {best1:.4f}, Stage 2: {best2:.4f}, Stage 3: {best3:.4f}")
    log(f"Best model saved to: {args.best_path}")

if __name__ == "__main__":
    main()
