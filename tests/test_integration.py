"""Integration tests for pylint-comfyui plugin."""

import subprocess
import tempfile
from pathlib import Path


def test_plugin_loads():
    """Test that pylint can load the plugin."""
    result = subprocess.run(
        ["pylint", "--load-plugins=pylint_comfyui", "--list-msgs"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert "comfyui-use-folder-paths" in result.stdout


def test_bad_node_detection():
    """Test that plugin detects issues in bad node example."""
    bad_code = """
import os
import glob

def process():
    files = glob.glob("models/*.bin")
    path = os.path.join("output", "result.txt")
"""

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(bad_code)
        f.flush()

        result = subprocess.run(
            [
                "pylint",
                "--load-plugins=pylint_comfyui",
                "--disable=all",
                "--enable=comfyui-use-folder-paths,comfyui-missing-folder-paths",
                f.name,
            ],
            capture_output=True,
            text=True,
        )

        assert "comfyui-use-folder-paths" in result.stdout
        assert "comfyui-missing-folder-paths" in result.stdout

    Path(f.name).unlink()


def test_good_node_passes():
    """Test that plugin passes good node example."""
    good_code = """
import folder_paths
import os

def process():
    models_dir = folder_paths.get_directory("models")
    path = os.path.join(models_dir, "result.txt")
"""

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(good_code)
        f.flush()

        result = subprocess.run(
            [
                "pylint",
                "--load-plugins=pylint_comfyui",
                "--disable=all",
                "--enable=comfyui-use-folder-paths,comfyui-missing-folder-paths",
                f.name,
            ],
            capture_output=True,
            text=True,
        )

        assert "comfyui-use-folder-paths" not in result.stdout
        assert "comfyui-missing-folder-paths" not in result.stdout

    Path(f.name).unlink()
