# ENS Voicemail - Modular Architecture

This directory contains the modularized components of the ENS Voicemail system, organized by functionality for better maintainability, testability, and code organization.

## Module Structure

### DTMF Modules (`/dtmf/`)
- **`dtmfUtils.js`** - DTMF constants, character mappings, and utility functions
- **`dtmfEncoder.js`** - ENS address to DTMF tone encoding with caching

### Audio Modules (`/audio/`)
- **`audioContext.js`** - Web Audio API context management
- **`audioWidget.js`** - HTML5 audio widget creation and management
- **`waveform.js`** - Canvas-based waveform visualization

### ENS Modules (`/ens/`)
- **`ensResolver.js`** - ENS address resolution using ethers.js

### UI Modules (`/ui/`)
- **`uiManager.js`** - DOM element references and UI updates

## Usage

### Importing Individual Modules
```javascript
import { dtmfUtils } from './modules/dtmf/dtmfUtils.js';
import { audioWidget } from './modules/audio/audioWidget.js';
import { ensResolver } from './modules/ens/ensResolver.js';
```

### Importing All Modules
```javascript
import { 
    dtmfUtils, 
    dtmfEncoder, 
    audioContextManager, 
    audioWidget, 
    waveformVisualizer, 
    ensResolver, 
    uiManager 
} from './modules/index.js';
```

## Module Dependencies

```
main-modular.js
├── dtmfUtils (no dependencies)
├── dtmfEncoder (depends on dtmfUtils)
├── audioContext (no dependencies)
├── audioWidget (depends on audioContext)
├── waveform (no dependencies)
├── ensResolver (no dependencies)
└── uiManager (no dependencies)
```

## Benefits of Modular Structure

1. **Separation of Concerns** - Each module has a single responsibility
2. **Testability** - Modules can be tested independently
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Reusability** - Modules can be reused in other projects
5. **Code Organization** - Clear structure makes the codebase easier to navigate

## Migration from Monolithic Structure

The original `main.js` file has been decomposed into these modules:

- **DTMF Logic** → `dtmfUtils.js` + `dtmfEncoder.js`
- **Audio Generation** → `audioContext.js` + `audioWidget.js`
- **Waveform Drawing** → `waveform.js`
- **ENS Resolution** → `ensResolver.js`
- **UI Management** → `uiManager.js`
- **Application Logic** → `main-modular.js`

## Testing

Each module can be tested independently:

```javascript
// Example: Testing DTMF utilities
import { dtmfUtils } from './modules/dtmf/dtmfUtils.js';

test('DTMF to hex conversion', () => {
    const result = dtmfUtils.dtmfToHex(['*', 'A', 'B', 'C', '#']);
    expect(result).toBe('abc');
});
```

## Future Enhancements

- Add TypeScript definitions for better type safety
- Implement dependency injection for easier testing
- Add module-level error boundaries
- Create plugin system for extensibility 