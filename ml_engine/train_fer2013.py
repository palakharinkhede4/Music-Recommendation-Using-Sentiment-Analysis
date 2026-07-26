"""
========================================================================
High-Accuracy Facial Emotion Recognition (FER) PyTorch Training Script
========================================================================
Dataset: FER2013 / AffectNet (4 Classes: Happy, Sad, Neutral, Angry)

Instructions to run on your remote CPU/GPU:
1. Download FER2013 or custom dataset:
   - Run: python ml_engine/train_fer2013.py --data_dir ./dataset --epochs 30 --batch_size 64
2. Once training finishes, place the saved `emotion_model_best.pth` file inside `ml_engine/`
"""

import os
import argparse
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models

class HighAccuracyEmotionNet(nn.Module):
    def __init__(self, num_classes=4, pretrained=True):
        super(HighAccuracyEmotionNet, self).__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        if x.shape[1] == 1:
            x = x.repeat(1, 3, 1, 1)
        return self.backbone(x)

def train_model(data_dir, epochs=30, batch_size=64, lr=0.0005, output_path="ml_engine/emotion_model_best.pth"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Training High-Accuracy FER Model on device: {device}")
    
    # Advanced Data Augmentations for high accuracy
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "validation")
    
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print(f"[!] Dataset path '{data_dir}' missing train/validation subdirectories.")
        print("[!] Download FER2013 or AffectNet dataset into dataset/ folder with subfolders:")
        print("    dataset/train/Happy, dataset/train/Sad, dataset/train/Neutral, dataset/train/Angry")
        return

    train_dataset = datasets.ImageFolder(root=train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(root=val_dir, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)

    model = HighAccuracyEmotionNet(num_classes=4, pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_acc = 0.0

    for epoch in range(epochs):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()

        epoch_loss = running_loss / total
        epoch_acc = correct / total

        # Validation
        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (preds == labels).sum().item()

        val_epoch_loss = val_loss / val_total
        val_epoch_acc = val_correct / val_total

        scheduler.step()

        print(f"Epoch {epoch+1:02d}/{epochs:02d} | "
              f"Train Acc: {epoch_acc:.4f} | Val Acc: {val_epoch_acc:.4f}")

        if val_epoch_acc > best_acc:
            best_acc = val_epoch_acc
            os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
            torch.save(model.state_dict(), output_path)
            print(f"  [+] Saved new best FER model to {output_path} (Validation Accuracy: {best_acc*100:.2f}%)")

    print("[*] Training pipeline completed!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train High-Accuracy FER PyTorch Model")
    parser.add_argument("--data_dir", type=str, default="./dataset")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=0.0005)
    parser.add_argument("--output", type=str, default="ml_engine/emotion_model_best.pth")
    args = parser.parse_args()

    train_model(args.data_dir, args.epochs, args.batch_size, args.lr, args.output)
