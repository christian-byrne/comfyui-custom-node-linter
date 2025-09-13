"""Checker for proper folder_paths usage in ComfyUI nodes."""

import re

from pylint.checkers import BaseChecker
from pylint.lint import PyLinter


class FolderPathsChecker(BaseChecker):
    """Checker to enforce usage of folder_paths module instead of direct filesystem access."""

    name = "comfyui-folder-paths"

    msgs = {
        "C9001": (
            "Direct filesystem access detected: %s. Use folder_paths.get_directory() instead",
            "comfyui-use-folder-paths",
            "ComfyUI nodes should use folder_paths module for filesystem operations "
            "to ensure compatibility across different environments and cloud deployments.",
        ),
        "C9002": (
            "Hardcoded path detected: %s. Use folder_paths.get_directory() to get base paths",
            "comfyui-hardcoded-path",
            "Hardcoded paths should be avoided. Use folder_paths.get_directory() "
            "to get base directories like 'models', 'input', 'output', etc.",
        ),
        "W9003": (
            "Consider importing folder_paths when using filesystem operations",
            "comfyui-missing-folder-paths",
            "File contains filesystem operations but doesn't import folder_paths. "
            "Add 'import folder_paths' to use ComfyUI's path utilities.",
        ),
    }

    options = (
        (
            "comfyui-allowed-direct-fs",
            {
                "default": False,
                "type": "yn",
                "metavar": "<y or n>",
                "help": "Allow direct filesystem operations when folder_paths is imported",
            },
        ),
    )

    def __init__(self, linter: PyLinter) -> None:
        super().__init__(linter)
        self.folder_paths_imported: bool = False
        self.folder_paths_alias: str = "folder_paths"
        self.has_filesystem_operations: bool = False

        # Filesystem functions that should use folder_paths
        self.filesystem_functions = {
            "os.path.join",
            "os.path.exists",
            "os.path.isfile",
            "os.path.isdir",
            "os.path.dirname",
            "os.path.basename",
            "os.path.abspath",
            "os.path.realpath",
            "os.listdir",
            "os.makedirs",
            "os.mkdir",
            "os.walk",
            "os.getcwd",
            "glob.glob",
            "glob.iglob",
            "pathlib.Path",
            "shutil.copy",
            "shutil.copy2",
            "shutil.copytree",
            "shutil.move",
            "os.scandir",
            "os.stat",
            "os.lstat",
        }

        # Patterns for hardcoded paths
        self.hardcoded_path_patterns = [
            r"['\"]\.\.?/",  # Relative paths like "../" or "./"
            r"['\"][^'\"]*/(models|input|output|temp)[^'\"]*['\"]",  # ComfyUI dirs
        ]

    def visit_module(self, node) -> None:
        """Reset state for each module."""
        self.folder_paths_imported = False
        self.folder_paths_alias = "folder_paths"
        self.has_filesystem_operations = False

    def visit_import(self, node) -> None:
        """Check for folder_paths imports."""
        for name, alias in node.names:
            if name == "folder_paths":
                self.folder_paths_imported = True
                if alias:
                    self.folder_paths_alias = alias

    def visit_importfrom(self, node) -> None:
        """Check for 'from folder_paths import ...' statements."""
        if node.modname == "folder_paths":
            self.folder_paths_imported = True

    def visit_call(self, node) -> None:
        """Check function calls for filesystem operations."""
        func_name = self._get_call_name(node)

        if func_name in self.filesystem_functions:
            self.has_filesystem_operations = True

            # Check if this is problematic usage
            if not self._is_allowed_filesystem_call(func_name, node):
                suggestion = self._get_suggestion(func_name)
                self.add_message(
                    "comfyui-use-folder-paths",
                    node=node,
                    args=(f"{func_name}. {suggestion}",),
                )

    def visit_const(self, node) -> None:
        """Check string constants for hardcoded paths."""
        if isinstance(node.value, str):
            for pattern in self.hardcoded_path_patterns:
                if re.search(pattern, node.value):
                    self.add_message(
                        "comfyui-hardcoded-path", node=node, args=(repr(node.value),)
                    )
                    break

    def leave_module(self, node) -> None:
        """Check if folder_paths should be imported."""
        if self.has_filesystem_operations and not self.folder_paths_imported:
            self.add_message("comfyui-missing-folder-paths", node=node)

    def _get_call_name(self, node) -> str:
        """Extract the full name of a function call."""
        try:
            return node.func.as_string()
        except AttributeError:
            return ""

    def _is_allowed_filesystem_call(self, func_name: str, node) -> bool:
        """Check if a filesystem call is allowed."""
        # If folder_paths is imported, be more lenient with basic os.path operations
        if self.folder_paths_imported:
            # Allow basic path operations when folder_paths is imported
            # (assuming they're used correctly after getting base paths)
            if func_name in {
                "os.path.join",
                "os.path.exists",
                "os.path.isfile",
                "os.path.isdir",
            }:
                return True

        # Check if the call already uses folder_paths directly
        call_source = self._get_node_source(node)
        if self.folder_paths_alias in call_source:
            return True

        return False

    def _get_node_source(self, node) -> str:
        """Get the source code of a node (approximate)."""
        try:
            return node.as_string()
        except AttributeError:
            return ""

    def _get_suggestion(self, func_name: str) -> str:
        """Get a suggestion for how to fix the filesystem access."""
        suggestions = {
            "os.path.join": "Use folder_paths.get_directory() to get base paths first",
            "os.listdir": "Use folder_paths.get_directory() then os.listdir()",
            "glob.glob": "Use folder_paths.get_directory() then glob.glob()",
            "pathlib.Path": "Use folder_paths.get_directory() / pathlib.Path()",
            "os.makedirs": "Use folder_paths.get_directory() to get base paths",
        }

        return suggestions.get(func_name, "Consider using folder_paths.get_directory()")
