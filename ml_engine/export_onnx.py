"""
ONNX Model Export and Quantization Tool for EfficientNet-B5 FER Model
Converts PyTorch checkpoint (.pth) to ONNX (.onnx) and quantized INT8 ONNX for web/cloud deployment.
"""

import os
import sys
import argparse

# Fix Windows console encoding for PyTorch exporter emojis
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import torch
import torch.nn as nn
from torchvision import models

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CHECKPOINT = os.path.join(BASE_DIR, "best_efficientnet_b5_faces_fer4.pth")
DEFAULT_ONNX = os.path.join(BASE_DIR, "efficientnet_b5_fer4.onnx")
DEFAULT_QUANT_ONNX = os.path.join(BASE_DIR, "efficientnet_b5_fer4_quant.onnx")

def build_efficientnet_b5(num_classes=4):
    model = models.efficientnet_b5(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.25),
        nn.Linear(512, num_classes)
    )
    return model

def export_to_onnx(checkpoint_path=DEFAULT_CHECKPOINT, output_onnx_path=DEFAULT_ONNX, quantize=True):
    print(f"[*] Building EfficientNet-B5 architecture (4 classes: angry, happy, neutral, sad)...")
    model = build_efficientnet_b5(num_classes=4)

    if os.path.isfile(checkpoint_path):
        print(f"[*] Loading weights from: {checkpoint_path}")
        ckpt = torch.load(checkpoint_path, map_location="cpu")
        if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
            state_dict = ckpt["model_state_dict"]
        elif isinstance(ckpt, dict) and "state_dict" in ckpt:
            state_dict = ckpt["state_dict"]
        else:
            state_dict = ckpt

        clean_state_dict = {}
        for k, v in state_dict.items():
            nk = k.replace("module.", "") if k.startswith("module.") else k
            clean_state_dict[nk] = v

        model.load_state_dict(clean_state_dict, strict=True)
        print("[+] Checkpoint weights loaded successfully.")
    else:
        print(f"[!] Warning: Checkpoint not found at {checkpoint_path}. Exporting base initialized model.")

    model.eval()

    # Input tensor shape: (Batch=1, Channels=3, Height=456, Width=456)
    dummy_input = torch.randn(1, 3, 456, 456, requires_grad=False)

    print(f"[*] Exporting ONNX model to: {output_onnx_path}")
    os.makedirs(os.path.dirname(output_onnx_path) or ".", exist_ok=True)

    torch.onnx.export(
        model,
        dummy_input,
        output_onnx_path,
        export_params=True,
        opset_version=18,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "output": {0: "batch_size"}
        }
    )
    print(f"[✓] Successfully exported ONNX model ({os.path.getsize(output_onnx_path) / (1024**2):.2f} MB)")

    if quantize:
        try:
            from onnxruntime.quantization import quantize_dynamic, QuantType
            print(f"[*] Performing dynamic INT8 quantization -> {DEFAULT_QUANT_ONNX}")
            quantize_dynamic(
                output_onnx_path,
                DEFAULT_QUANT_ONNX,
                weight_type=QuantType.QUInt8
            )
            print(f"[✓] Successfully generated quantized ONNX model ({os.path.getsize(DEFAULT_QUANT_ONNX) / (1024**2):.2f} MB)")
        except ImportError:
            print("[i] Note: onnxruntime not installed for quantization step. Install 'onnxruntime' if INT8 quantization is needed.")
        except Exception as e:
            print(f"[!] Quantization notice: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export EfficientNet-B5 to ONNX")
    parser.add_argument("--checkpoint", type=str, default=DEFAULT_CHECKPOINT, help="Path to .pth checkpoint")
    parser.add_argument("--output", type=str, default=DEFAULT_ONNX, help="Output .onnx path")
    parser.add_argument("--quantize", action="store_true", help="Perform dynamic quantization")
    args = parser.parse_args()

    export_to_onnx(args.checkpoint, args.output, args.quantize)
