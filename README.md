# pylint-comfyui

Pylint plugin to enforce ComfyUI coding standards and best practices.

## Installation

```bash
pip install pylint-comfyui
```

## Usage

```bash
# Run with plugin loaded
pylint --load-plugins=pylint_comfyui your_node.py

# Configure in pyproject.toml
[tool.pylint.MASTER]
load-plugins = ["pylint_comfyui"]
```

## Rules

### Filesystem Standards (C9001-W9003)
- **C9001**: Use `folder_paths` module instead of direct filesystem access
- **C9002**: Avoid hardcoded paths, use `folder_paths.get_directory()`
- **W9003**: Import `folder_paths` when using filesystem operations

### Security Standards (E9101-E9106)
- **E9101**: No `eval()` usage (security risk)
- **E9102**: No `exec()` usage (security risk)
- **E9104**: No code obfuscation
- **E9106**: No custom route registration via `PromptServer.routes`
- **W9103**: No direct URLs in requirements
- **W9105**: Warning for subprocess usage

### ComfyUI API Standards (W9204-E9206)
- **W9204**: Use `model_management.get_torch_device()` instead of manual device detection
- **W9205**: Use type annotations from `comfy_api.latest.IO` enum
- **E9206**: Only import from public API (`comfy_api`, `folder_paths`, `nodes`)

## Examples

### Bad
```python
import os
import glob
from comfy.model_management import get_torch_device  # E9206: Internal API
from server import PromptServer

class MyNode:
    def process(self):
        # C9001: Direct filesystem access
        files = glob.glob("models/*.bin")
        path = os.path.join("output", "result.txt")
        
        # W9204: Manual device detection
        if torch.cuda.is_available():
            device = "cuda"

# E9106: Custom route registration
@PromptServer.instance.routes.get("/custom")
async def handler(request):
    return {"data": "bad"}
```

### Good  
```python
import folder_paths
import os
from comfy_api.latest import IO  # Public API

class MyNode:
    def process(self):
        # Uses folder_paths properly
        models_dir = folder_paths.get_directory("models")
        output_dir = folder_paths.get_directory("output")
        path = os.path.join(output_dir, "result.txt")
        
        # W9205: Use IO enum for types
        return_type = IO.STRING
```

## Development

```bash
git clone <repo>
cd pylint-comfyui
pip install -e .
pytest
```

## License

MIT