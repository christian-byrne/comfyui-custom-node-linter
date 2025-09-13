"""Security-focused checker for ComfyUI nodes."""

import re

from pylint.checkers import BaseChecker
from pylint.lint import PyLinter


class SecurityChecker(BaseChecker):
    """Checker for security issues in ComfyUI nodes."""

    name = "comfyui-security"

    msgs = {
        "E9101": (
            "Use of eval() detected. This is a security risk and not allowed in ComfyUI nodes",
            "comfyui-no-eval",
            "The eval() function can execute arbitrary code and poses serious security risks. "
            "ComfyUI nodes should not use eval() for security reasons.",
        ),
        "E9102": (
            "Use of exec() detected. This is a security risk and not allowed in ComfyUI nodes",
            "comfyui-no-exec",
            "The exec() function can execute arbitrary code and poses serious security risks. "
            "ComfyUI nodes should not use exec() for security reasons.",
        ),
        "W9103": (
            "Direct URL in requirements detected: %s. Use package names instead",
            "comfyui-no-direct-urls",
            "Requirements files should use package names and version specifiers "
            "rather than direct URLs for security and reproducibility.",
        ),
        "E9104": (
            "Code obfuscation detected. ComfyUI nodes must be readable and maintainable",
            "comfyui-no-obfuscation",
            "Obfuscated code is not allowed in ComfyUI nodes for security and "
            "maintainability reasons.",
        ),
        "W9105": (
            "subprocess call detected: %s. Be cautious with system commands",
            "comfyui-subprocess-warning",
            "Subprocess calls can be security risks. Ensure proper input validation "
            "and consider if the operation is necessary.",
        ),
        "E9106": (
            "Custom route registration detected: %s. ComfyUI nodes must not add custom server routes",
            "comfyui-no-custom-routes",
            "Adding custom routes via PromptServer.routes or similar methods is prohibited. "
            "Custom nodes should not modify the web server routing.",
        ),
    }

    def __init__(self, linter: PyLinter) -> None:
        super().__init__(linter)

        # Patterns that might indicate obfuscation
        self.obfuscation_patterns = [
            r"exec\s*\(\s*''.join\(",  # exec(''.join(...))
            r"eval\s*\(\s*''.join\(",  # eval(''.join(...))
            r"__import__\s*\(\s*''.join\(",  # Dynamic imports with obfuscation
            r"chr\s*\(\s*\d+\s*\)",  # Character code obfuscation
            r"bytes\.fromhex\s*\(",  # Hex string obfuscation
        ]

    def visit_call(self, node) -> None:
        """Check function calls for security issues."""
        func_name = self._get_call_name(node)

        # Check for eval/exec
        if func_name == "eval":
            self.add_message("comfyui-no-eval", node=node)
        elif func_name == "exec":
            self.add_message("comfyui-no-exec", node=node)

        # Check for subprocess calls
        elif func_name.startswith("subprocess."):
            self.add_message("comfyui-subprocess-warning", node=node, args=(func_name,))
        elif func_name in {"os.system", "os.popen", "commands.getoutput"}:
            self.add_message("comfyui-subprocess-warning", node=node, args=(func_name,))

    def visit_attribute(self, node) -> None:
        """Check attribute access for PromptServer route registration."""
        # Check for PromptServer.routes access
        if hasattr(node, "attrname") and node.attrname == "routes":
            attr_name = self._get_attribute_name(node)
            if "PromptServer" in attr_name and "instance" in attr_name:
                self.add_message(
                    "comfyui-no-custom-routes", node=node, args=(attr_name,)
                )

        # Check for direct app manipulation
        elif hasattr(node, "attrname") and node.attrname == "app":
            attr_name = self._get_attribute_name(node)
            if "PromptServer" in attr_name and "instance" in attr_name:
                self.add_message(
                    "comfyui-no-custom-routes", node=node, args=(attr_name,)
                )

    def visit_module(self, node) -> None:
        """Check the entire module for obfuscation patterns."""
        try:
            # Get the source code if available
            if hasattr(node, "lineno") and hasattr(self.linter, "current_file"):
                with open(self.linter.current_file, encoding="utf-8") as f:
                    source = f.read()
                    self._check_obfuscation(source, node)
        except (OSError, UnicodeDecodeError, AttributeError):
            pass

    def _check_obfuscation(self, source: str, node) -> None:
        """Check source code for obfuscation patterns."""
        for pattern in self.obfuscation_patterns:
            if re.search(pattern, source):
                self.add_message("comfyui-no-obfuscation", node=node)
                break

    def _get_call_name(self, node) -> str:
        """Extract the full name of a function call."""
        try:
            return node.func.as_string()
        except AttributeError:
            return ""

    def _get_attribute_name(self, node) -> str:
        """Extract the full name of an attribute access."""
        try:
            return node.as_string()
        except AttributeError:
            return ""
