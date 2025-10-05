# ESLint ComfyUI Plugin Test Suite

Comprehensive test suite for the ESLint ComfyUI plugin, ensuring reliable detection of deprecated APIs in real-world ComfyUI extension code.

## Test Structure

```
tests/
├── fixtures/              # Test code samples
│   ├── legacy-extension.ts     # ComfyUI extension with deprecated APIs
│   ├── legacy-widget.vue       # Vue component with deprecated APIs  
│   └── modern-extension.ts     # Modern ComfyUI extension (no deprecated APIs)
├── integration/           # End-to-end tests
│   ├── extension-linting.test.ts   # Tests with real extension code
│   ├── rule-execution.test.ts      # ESLint CLI integration tests
│   └── test-eslintrc.js           # ESLint config for integration tests
├── performance/           # Performance tests
│   └── large-codebase.test.ts     # Tests with large files
├── rules/                 # Unit tests for individual rules
│   └── no-deprecated-comfyui-apis.test.ts
└── setup.ts              # Jest test setup
```

## Test Categories

### 1. Unit Tests (`tests/rules/`)

**Purpose**: Test individual ESLint rules in isolation

**Coverage**:
- ✅ Valid code patterns (should not trigger warnings)
- ✅ Invalid code patterns (should trigger warnings)
- ✅ Rule configuration options
- ✅ Edge cases and error conditions

**Run with**: `npm test`

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test complete plugin functionality with realistic ComfyUI extension code

**Coverage**:
- ✅ Real ComfyUI extension patterns
- ✅ Vue component integration
- ✅ TypeScript and JavaScript support
- ✅ ESLint CLI integration
- ✅ Configuration testing (ignore patterns, severity levels)
- ✅ Multiple file processing

**Run with**: `npm run test:integration`

### 3. Performance Tests (`tests/performance/`)

**Purpose**: Ensure plugin performs well with large codebases

**Coverage**:
- ✅ Large files (1000+ lines)
- ✅ Multiple files concurrently
- ✅ Performance consistency across runs
- ✅ Memory usage optimization

**Run with**: `npm run test:integration` (included in integration suite)

### 4. Plugin Validation (`scripts/test-plugin.js`)

**Purpose**: End-to-end validation with built plugin

**Coverage**:
- ✅ Plugin loads correctly
- ✅ Deprecated APIs detected in legacy code
- ✅ Modern code passes without warnings
- ✅ Configuration options work correctly
- ✅ Real-world extension patterns

**Run with**: `npm run test:plugin`

## Test Fixtures

### Legacy Extension (`legacy-extension.ts`)

Contains realistic ComfyUI extension code using **deprecated APIs**:

- ❌ `serialise()` function from vintage clipboard
- ❌ `onExecuted()` lifecycle method
- ❌ `recreate()` method
- ❌ `subgraphs` property usage
- ❌ Extension registration patterns with deprecated APIs

**Expected Result**: Multiple deprecated API warnings

### Legacy Widget (`legacy-widget.vue`)

Vue component using **deprecated APIs** in both script sections:

- ❌ Composition API with deprecated functions
- ❌ Options API with deprecated methods
- ❌ Template integration with deprecated patterns

**Expected Result**: Deprecated API warnings in Vue script sections

### Modern Extension (`modern-extension.ts`)

Contains modern ComfyUI extension code using **current APIs**:

- ✅ `onNodeExecuted()` instead of `onExecuted()`
- ✅ `refresh()` instead of `recreate()`
- ✅ Modern serialization with `JSON.stringify()`
- ✅ Current extension registration patterns

**Expected Result**: No deprecated API warnings

## Running Tests

### Quick Test (Unit Tests Only)
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Plugin End-to-End Test
```bash
npm run test:plugin
```

### All Tests
```bash
npm run test:all
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Expected Test Results

### ✅ Successful Test Run Should Show:

1. **Unit Tests**: All rule logic tests pass
2. **Integration Tests**: 
   - Legacy files trigger expected deprecated API warnings
   - Modern files pass without deprecated API warnings
   - Configuration options work correctly
3. **Performance Tests**: Plugin completes within reasonable time limits
4. **Plugin Test**: Built plugin correctly identifies deprecated APIs

### ❌ Test Failures Might Indicate:

1. **Plugin Loading Issues**: Check TypeScript compilation and exports
2. **Rule Logic Errors**: Deprecated API data might be outdated or incorrect
3. **Performance Problems**: Rule might be inefficient with large codebases
4. **Configuration Issues**: Rule options not working as expected

## Maintaining Tests

### When ComfyUI Frontend Updates:

1. **Update Deprecated APIs**:
   ```bash
   npm run extract-deprecated-apis
   ```

2. **Update Test Fixtures**: Add new deprecated APIs to legacy test files

3. **Run Full Test Suite**: Ensure all tests still pass
   ```bash
   npm run test:all
   ```

### Adding New Test Cases:

1. **Add to Fixtures**: Create new test files in `tests/fixtures/`
2. **Update Integration Tests**: Add test cases for new patterns
3. **Document Expected Behavior**: Update this README with new test scenarios

## Test Configuration

### ESLint Test Config (`tests/integration/test-eslintrc.js`)

Configured for testing:
- TypeScript parser
- ComfyUI plugin enabled
- Error-level deprecated API rule
- Standard ignore patterns

### Jest Config (`jest.config.js`)

Configured for:
- TypeScript support with ts-jest
- Test file patterns
- Coverage collection
- Test setup file

## Debugging Tests

### Verbose Test Output:
```bash
npm test -- --verbose
```

### Run Specific Test File:
```bash
npm test -- tests/integration/extension-linting.test.ts
```

### Debug Plugin Test:
```bash
npm run build && node scripts/test-plugin.js
```

### Manual ESLint Test:
```bash
npx eslint --config tests/integration/test-eslintrc.js tests/fixtures/legacy-extension.ts
```

## CI/CD Integration

This test suite is designed for continuous integration:

1. **Fast Unit Tests**: Quick feedback on rule logic
2. **Comprehensive Integration Tests**: Ensure real-world compatibility  
3. **Performance Validation**: Prevent performance regressions
4. **Built Plugin Validation**: Test actual package output

Recommended CI pipeline:
```bash
npm install
npm run build
npm run test:all
```

## Contributing

When contributing to the plugin:

1. **Add Tests First**: Write tests for new rules or features
2. **Update Fixtures**: Ensure test files cover new scenarios
3. **Run Full Suite**: Verify all tests pass before submitting
4. **Update Documentation**: Keep this README current with test changes

For questions about the test suite, refer to the integration test examples or create new test cases following the established patterns.