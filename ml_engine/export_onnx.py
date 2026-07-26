"""
ONNX Model Export Tool for Facial Emotion Recognition
Converts PyTorch checkpoint (.pth) to ONNX (.onnx) for fast in-browser and cross-platform deployment.
"""

import argparse
import torch
from train import EmotionCNN

def export_to_onnx(checkpoint_path, output_onnx_path, num_classes=5):
    print(f"[*] Loading model checkpoint from: {checkpoint_path}")
    model = EmotionCNN(num_classes=num_classes)
    
    try:
        model.load_state_dict(torch.load(checkpoint_path, map_location=torch.device('cpu')))
        print("[+] Checkpoint loaded successfully.")
    except Exception as e:
        print(f"[!] Warning: Could not load checkpoint file ({e}). Exporting default initialized architecture.")
    
    model.eval()

    # Dummy input tensor matching expected shape: (Batch=1, Channels=1, Height=48, Width=48)
    dummy_input = torch.randn(1, 1, 48, 48, requires_grad=False)

    print(f"[*] Exporting to ONNX format at: {output_onnx_path}")
    torch.onnx.export(
        model,
        dummy_input,
        output_onnx_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    print(f"[✓] Successfully exported ONNX model to: {output_onnx_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export Emotion Model to ONNX")
    parser.add_argument("--checkpoint", type=str, default="emotion_model.pth", help="Path to PyTorch .pth file")
    parser.add_argument("--output", type=str, default="emotion_model.onnx", help="Path for exported .onnx file")
    parser.add_argument("--classes", type=int, default=5, help="Number of emotion classes")
    args = parser.parse_args()

    export_to_onnx(args.checkpoint, args.output, args.classes)
