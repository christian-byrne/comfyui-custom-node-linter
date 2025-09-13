"""Checker for ComfyUI node structure and v3 schema compliance."""

import ast
from typing import List

from pylint.checkers import BaseChecker
from pylint.lint import PyLinter


class NodeStructureChecker(BaseChecker):
    """Checker for ComfyUI node structure and API compliance."""

    name = "comfyui-node-structure"

    msgs = {
        "W9204": (
            "Manual device handling detected: %s",
            "comfyui-use-model-management",
            "Use ComfyUI's model_management.get_torch_device() instead of "
            "manual device detection for better compatibility.",
        ),
        "W9205": (
            "Consider using type annotations from comfy_api.latest.IO enum",
            "comfyui-use-io-types",
            "ComfyUI provides type annotations in comfy_api.latest.IO for better "
            "type safety and IDE support (e.g. IO.STRING, IO.IMAGE).",
        ),
        "E9206": (
            "Direct import from non-API ComfyUI module: %s",
            "comfyui-non-api-import",
            "Avoid importing directly from internal ComfyUI modules. "
            "Use only public API modules to ensure compatibility.",
        ),
    }

    def __init__(self, linter: PyLinter) -> None:
        super().__init__(linter)
        self.node_classes: List[ast.ClassDef] = []
        self.has_model_management_import: bool = False

        # Known ComfyUI public API modules (allowed) - only comfy_api and root level
        self.api_modules = {"folder_paths", "nodes"}
        self.api_prefixes = {"comfy_api"}

        # Internal modules (should be avoided) - anything under comfy/
        self.internal_prefixes = {"comfy"}

    def visit_module(self, node: ast.Module) -> None:
        """Reset state for each module."""
        self.node_classes = []
        self.has_model_management_import = False

    def visit_import(self, node) -> None:
        """Check imports for non-API usage."""
        for name, _alias in node.names:
            # Check if it's an internal comfy module
            if any(name.startswith(prefix + ".") for prefix in self.internal_prefixes):
                if not any(name.startswith(prefix) for prefix in self.api_prefixes):
                    self.add_message("comfyui-non-api-import", node=node, args=(name,))

    def visit_importfrom(self, node) -> None:
        """Check from imports for non-API usage."""
        if node.modname:
            # Check if importing from internal comfy module
            if any(
                node.modname.startswith(prefix + ".")
                for prefix in self.internal_prefixes
            ):
                if not any(
                    node.modname.startswith(prefix) for prefix in self.api_prefixes
                ):
                    self.add_message(
                        "comfyui-non-api-import", node=node, args=(node.modname,)
                    )

    def visit_classdef(self, node: ast.ClassDef) -> None:
        """Check class definitions for ComfyUI node patterns."""
        # Look for classes that might be ComfyUI nodes
        if self._is_likely_comfyui_node(node):
            self.node_classes.append(node)
            self._check_node_structure(node)

    def visit_call(self, node) -> None:
        """Check function calls for device handling patterns."""
        func_name = self._get_call_name(node)

        # Check for manual device handling that should use model_management.get_torch_device()
        device_patterns = [
            "torch.cuda.is_available",
            "torch.cuda.device_count",
            "torch.cuda.set_device",
            "torch.cuda.current_device",
            "torch.device",
        ]

        for pattern in device_patterns:
            if pattern in func_name:
                self.add_message(
                    "comfyui-use-model-management",
                    node=node,
                    args=(
                        f"Use model_management.get_torch_device() instead of {pattern}"
                    ),
                )
                break

    def _is_likely_comfyui_node(self, node: ast.ClassDef) -> bool:
        """Heuristic to determine if a class is likely a ComfyUI node."""
        # Look for common ComfyUI node patterns
        method_names = {
            method.name for method in node.body if isinstance(method, ast.FunctionDef)
        }
        class_attrs = {
            attr.targets[0].id
            for attr in node.body
            if isinstance(attr, ast.Assign) and isinstance(attr.targets[0], ast.Name)
        }

        # Common patterns that indicate ComfyUI nodes
        node_indicators = [
            # Has typical ComfyUI methods
            "INPUT_TYPES" in method_names or "INPUT_TYPES" in class_attrs,
            "RETURN_TYPES" in class_attrs,
            "FUNCTION" in class_attrs,
            "CATEGORY" in class_attrs,
            # Or has typical processing methods
            any(
                method in method_names
                for method in ["execute", "process", "forward", "run"]
            ),
            # Or inherits from common base classes (simplified check)
            any(
                "Node" in base.id if isinstance(base, ast.Name) else False
                for base in node.bases
            ),
        ]

        return any(node_indicators)

    def _check_node_structure(self, node) -> None:
        """Check if a ComfyUI node follows best practices."""
        # For now, we're not enforcing v3 schema requirements
        # This method can be extended later if needed
        pass

    def _get_call_name(self, node) -> str:
        """Extract the full name of a function call."""
        try:
            return node.func.as_string()
        except AttributeError:
            return ""
