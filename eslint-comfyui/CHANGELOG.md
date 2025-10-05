# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-07

### Added
- Initial release of eslint-plugin-comfyui
- **no-deprecated-comfyui-apis** rule (comfyui/no-deprecated-comfyui-apis)
  - Automatically detects usage of deprecated ComfyUI frontend APIs
  - Based on extracted `@deprecated` JSDoc tags from ComfyUI frontend source
  - Supports configurable severity levels and ignore patterns
  - Shows deprecation context and file locations
  - Covers 201 deprecated APIs from ComfyUI frontend codebase
- Automated deprecated API extraction script
  - Scans TypeScript and Vue files for `@deprecated` comments
  - Extracts deprecation reasons and context
  - Generates structured JSON data for ESLint rule consumption
  - Supports multiple ComfyUI frontend source directories
- ESLint configuration presets
  - **base**: Basic configuration with warnings
  - **recommended**: Recommended configuration for most projects  
  - **strict**: Strict configuration for new projects
- TypeScript support with full type safety
- Comprehensive test suite with 100% rule coverage
- Example configurations and usage patterns
- Integration with ComfyUI development ecosystem

### Features
- Automatic deprecated API detection from ComfyUI frontend source
- Configurable rule severity and ignore patterns
- Context-aware error messages with file and line information
- Support for TypeScript, JavaScript, and Vue files
- Multiple ESLint configuration presets
- Extraction script for keeping deprecated APIs up-to-date