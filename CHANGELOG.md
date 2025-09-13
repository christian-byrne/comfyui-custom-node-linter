# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-07

### Added
- Initial release of pylint-comfyui plugin
- Filesystem standards checker (C9001-W9003)
  - Enforce folder_paths module usage for all filesystem operations
  - Detect hardcoded paths in string literals  
  - Require folder_paths import when filesystem operations detected
  - Extended coverage: os.path, glob, shutil, pathlib operations
- Security standards checker (E9101-E9106)
  - Block eval/exec usage
  - Warn about subprocess calls
  - Detect code obfuscation
  - Flag direct URLs in requirements
  - Prevent custom route registration via PromptServer.routes
- ComfyUI API standards checker (W9204-E9206)
  - Prevent manual device detection (suggest model_management.get_torch_device())
  - Encourage comfy_api.latest.IO enum usage for type annotations
  - Restrict imports to public API only (comfy_api, folder_paths, nodes)
- Pylint plugin registration and entry points
- Integration test suite
- Documentation and examples