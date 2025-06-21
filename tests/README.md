# Test Structure

The tests have been organized into focused test files for better maintainability and faster execution.

## Test Files

### `ui.spec.js` - UI Tests
Tests for basic UI functionality, page loading, and responsiveness.
- Page loading with all sections
- Mobile responsiveness
- Debug logging functionality

**Run with:** `npm run test:ui-spec`

### `ens-validation.spec.js` - ENS Validation Tests
Tests for ENS address validation and resolution.
- ENS address format validation
- ENS resolution (success/failure)
- Network error handling

**Run with:** `npm run test:ens`

### `audio-generation.spec.js` - Audio Generation Tests
Tests for DTMF tone generation and audio features.
- Tone generation after ENS resolution
- Waveform display
- Tone information display

**Run with:** `npm run test:audio`

### `recording.spec.js` - Recording Tests
Tests for recording functionality and file upload.
- Recording controls state
- File upload for decoding

**Run with:** `npm run test:recording`

## Available Commands

### Run All Tests
```bash
npm test
```

### Run Specific Test Groups
```bash
npm run test:ui-spec      # UI tests only
npm run test:ens          # ENS validation tests only
npm run test:audio        # Audio generation tests only
npm run test:recording    # Recording tests only
```

### Run Tests with Browser UI (Headed Mode)
```bash
npm run test:ui-spec:headed
npm run test:ens:headed
npm run test:audio:headed
npm run test:recording:headed
```

### Other Test Commands
```bash
npm run test:headed       # All tests with browser UI
npm run test:ui           # Playwright UI mode
npm run test:debug        # Debug mode
npm run test:cdp          # Chrome DevTools Protocol debugging
npm run report            # Show test report
```

## Test Coverage

Each test file runs across multiple browsers:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## Benefits of Split Tests

1. **Faster Development**: Run only relevant tests during development
2. **Focused Debugging**: Isolate issues to specific functionality
3. **Parallel Execution**: Tests can run in parallel across browsers
4. **Better Organization**: Clear separation of concerns
5. **Easier Maintenance**: Smaller, focused test files

## Running Tests During Development

For quick feedback during development:
```bash
# Test just the UI while working on styling
npm run test:ui-spec

# Test ENS validation while working on blockchain integration
npm run test:ens

# Test audio generation while working on DTMF features
npm run test:audio

# Test recording while working on microphone features
npm run test:recording
``` 