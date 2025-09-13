"""Example ComfyUI node with standards violations."""

import glob
import os
from pathlib import Path

import torch
from server import PromptServer


class BadComfyUINode:
    """A node that violates ComfyUI standards."""

    def __init__(self):
        # C9001: Direct filesystem access
        self.models_dir = os.path.join("models", "checkpoints")
        self.config_path = Path("./config/settings.json")

        # W9204: Manual device detection
        if torch.cuda.is_available():
            self.device = "cuda"
        else:
            self.device = "cpu"

    def load_model(self, model_name):
        # C9001: Direct filesystem access with hardcoded paths
        model_files = glob.glob("models/checkpoints/*.safetensors")

        with open("./models/config.json") as f:
            config = f.read()  # noqa: F841

        # C9001: Direct directory listing
        available_models = os.listdir("models/checkpoints")  # noqa: F841

        return model_files[0] if model_files else None

    def save_output(self, data, filename):
        # C9001: Hardcoded output path
        output_path = os.path.join("output", filename)
        with open(output_path, "w") as f:
            f.write(str(data))


# E9106: Custom route registration (prohibited)
@PromptServer.instance.routes.get("/custom/endpoint")
async def custom_handler(request):
    """This violates the no-custom-routes rule."""
    return {"status": "ok"}
