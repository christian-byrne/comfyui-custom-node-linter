"""Pylint plugin for ComfyUI standards enforcement."""


def register(linter):
    """Register ComfyUI checkers with pylint."""
    from pylint_comfyui.checkers.folder_paths import FolderPathsChecker
    from pylint_comfyui.checkers.node_structure import NodeStructureChecker
    from pylint_comfyui.checkers.security import SecurityChecker

    linter.register_checker(FolderPathsChecker(linter))
    linter.register_checker(SecurityChecker(linter))
    linter.register_checker(NodeStructureChecker(linter))


__version__ = "0.1.0"
