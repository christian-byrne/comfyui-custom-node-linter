"""Example ComfyUI node that follows ComfyUI standards."""

import json
import os

import folder_paths
from comfy_api.latest import IO  # Public API


class GoodComfyUINode:
    """A node that follows ComfyUI standards."""

    def __init__(self):
        # ✅ Good: Using folder_paths to get base directories
        self.models_dir = folder_paths.get_directory("models")
        self.config_dir = folder_paths.get_directory("user")

    def load_model(self, model_name):
        # ✅ Good: Using folder_paths then standard file operations
        models_dir = folder_paths.get_directory("models")
        model_path = os.path.join(
            models_dir, "checkpoints", f"{model_name}.safetensors"
        )

        config_dir = folder_paths.get_directory("user")
        config_path = os.path.join(config_dir, "config.json")

        if os.path.exists(config_path):
            with open(config_path) as f:
                config = json.load(f)
        else:
            config = {}

        return model_path, config

    def save_output(self, data, filename):
        # ✅ Good: Using folder_paths for output directory
        output_dir = folder_paths.get_directory("output")
        output_path = os.path.join(output_dir, filename)

        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)

    def get_return_type(self):
        # ✅ Good: Using IO enum for type annotations
        return IO.STRING
