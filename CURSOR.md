# ENS Voicemail Audio Generator - Development Plan

## Project Overview
Build an application that generates audio clips containing DTMF (Dual-Tone Multi-Frequency) tones to transmit ENS (Ethereum Name Service) addresses via phone. These audio clips can be embedded in voicemail messages, allowing recipients with compatible phones to decode the ENS address like an audio QR code.

## Development Workflow with TODO.md

### How to Use TODO.md Effectively

The `TODO.md` file serves as your primary task management system during development. Here's how to use it effectively:

#### 1. **Task Organization**
- Tasks are organized by development phases with priority levels
- High Priority tasks should be completed first
- Check off tasks as you complete them: `- [x] Completed task`
- Add new tasks as you discover them during development

#### 2. **Daily Workflow**
1. **Start each session** by reviewing the current phase's tasks
2. **Pick the next uncompleted task** from the highest priority section
3. **Work on one task at a time** - avoid context switching
4. **Mark tasks as complete** when finished: `- [x] Task name`
5. **Update the "Next Priority"** at the bottom of TODO.md

#### 3. **Task Management Best Practices**
- **Be specific** - Each task should be actionable and testable
- **Break down large tasks** - If a task takes more than 2 hours, split it
- **Add context** - Include brief descriptions of what needs to be done
- **Update regularly** - Keep the list current as you discover issues

#### 4. **Priority Guidelines**
- **High Priority**: Core functionality, bugs, security issues
- **Medium Priority**: UI improvements, user experience enhancements
- **Low Priority**: Nice-to-have features, optimizations

#### 5. **Progress Tracking**
- The "Completed" section shows what's been done
- The "Known Issues" section tracks current problems
- Update the "Last Updated" timestamp when making changes

#### 6. **When to Update TODO.md**
- After completing a task
- When discovering a new bug or issue
- When adding new features to the roadmap
- At the end of each development session

### Current Development Status

The app currently has a working foundation with:
- ✅ Basic ENS validation and resolution
- ✅ DTMF tone generation and playback
- ✅ Audio recording and mixing
- ✅ File download functionality

**Next immediate priorities** (from TODO.md):
1. Fix ethers.js loading issues
2. Complete DTMF character mapping for hex digits
3. Test with real ENS addresses
4. Improve error handling

## Technical Requirements

### Core Functionality
1. **ENS Address Input**: Accept ENS addresses (e.g., `vitalik.eth`) as input
2. **Address Resolution**: Resolve ENS addresses to Ethereum addresses
3. **DTMF Tone Generation**: Convert address data into DTMF tones
4. **Audio File Creation**: Generate downloadable audio files (WAV/MP3)
5. **Playback Interface**: Preview generated audio clips

### Technical Stack
- **Frontend**: React/Next.js with TypeScript
- **Audio Processing**: Web Audio API + Tone.js library
- **ENS Integration**: ethers.js for ENS resolution
- **Styling**: Tailwind CSS for modern UI
- **Deployment**: Vercel/Netlify for hosting

## Development Phases

### Phase 1: Project Setup & Core Infrastructure
1. **Initialize Project**
   - Set up Next.js with TypeScript
   - Configure Tailwind CSS
   - Set up ESLint and Prettier
   - Initialize Git repository

2. **Basic UI Framework**
   - Create responsive layout
   - Design input form for ENS addresses
   - Add loading states and error handling
   - Implement basic styling

### Phase 2: ENS Integration
1. **ENS Resolution Service**
   - Integrate ethers.js for ENS queries
   - Handle ENS address validation
   - Implement error handling for invalid addresses
   - Add support for subdomains

2. **Address Formatting**
   - Convert Ethereum addresses to hex format
   - Implement checksum validation
   - Handle different ENS formats

### Phase 3: DTMF Tone Generation
1. **DTMF Specification Implementation**
   - Implement DTMF frequency pairs (697Hz, 770Hz, 852Hz, 941Hz for rows; 1209Hz, 1336Hz, 1477Hz, 1633Hz for columns)
   - Create tone generation functions
   - Implement proper timing (40ms tone, 40ms silence)

2. **Data Encoding Strategy**
   - Design encoding scheme for Ethereum addresses
   - Implement start/stop markers
   - Add error correction/detection
   - Consider compression for longer addresses

### Phase 4: Audio Processing
1. **Web Audio API Integration**
   - Generate sine waves for DTMF frequencies
   - Implement proper audio mixing
   - Add volume normalization
   - Handle sample rate conversion

2. **Audio File Generation**
   - Export to WAV format
   - Implement MP3 encoding (if needed)
   - Add metadata to audio files
   - Optimize file size

### Phase 5: User Interface & Experience
1. **Enhanced UI Components**
   - Add audio waveform visualization
   - Implement real-time audio preview
   - Create download functionality
   - Add copy-to-clipboard features

2. **User Experience Features**
   - Add address history
   - Implement favorites/bookmarks
   - Add sharing capabilities
   - Create usage instructions

### Phase 6: Advanced Features
1. **Customization Options**
   - Adjustable tone duration
   - Volume controls
   - Different encoding schemes
   - Custom start/stop sequences

2. **Validation & Testing**
   - Add comprehensive error handling
   - Implement unit tests
   - Add integration tests
   - Create test cases for various ENS formats

## Technical Considerations

### DTMF Encoding Strategy
- **Hex Encoding**: Convert Ethereum address to hex string
- **Character Mapping**: Map hex characters to DTMF keys
- **Error Detection**: Add checksum or CRC for validation
- **Compression**: Consider base32 encoding for shorter sequences

### Audio Quality Requirements
- **Sample Rate**: 44.1kHz for compatibility
- **Bit Depth**: 16-bit for good quality
- **Channels**: Mono for phone compatibility
- **Format**: WAV for maximum compatibility

### Browser Compatibility
- **Web Audio API**: Ensure cross-browser support
- **File Download**: Implement proper file handling
- **Mobile Support**: Optimize for mobile devices
- **Progressive Enhancement**: Graceful degradation

## File Structure
```
ens-voicemail/
├── src/
│   ├── components/
│   │   ├── ENSInput.tsx
│   │   ├── AudioGenerator.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── DownloadButton.tsx
│   ├── lib/
│   │   ├── ens.ts
│   │   ├── dtmf.ts
│   │   ├── audio.ts
│   │   └── utils.ts
│   ├── pages/
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
├── public/
├── package.json
└── README.md
```

## Dependencies
- `next`: React framework
- `react`: UI library
- `ethers`: Ethereum/ENS integration
- `tone`: Audio processing
- `tailwindcss`: Styling
- `typescript`: Type safety
- `@types/node`: TypeScript definitions

## Testing Strategy
1. **Unit Tests**: Test individual functions (ENS resolution, DTMF generation)
2. **Integration Tests**: Test complete audio generation pipeline
3. **Manual Testing**: Verify audio playback on different devices
4. **Cross-browser Testing**: Ensure compatibility across browsers

## Deployment Considerations
1. **Environment Variables**: Configure ENS provider endpoints
2. **Build Optimization**: Minimize bundle size
3. **CDN**: Optimize for global delivery
4. **Monitoring**: Add error tracking and analytics

## Future Enhancements
1. **Batch Processing**: Generate multiple audio files
2. **Custom Tones**: Allow custom frequency combinations
3. **QR Code Integration**: Generate QR codes alongside audio
4. **Mobile App**: Native mobile application
5. **API Service**: REST API for programmatic access

## Success Metrics
- Audio files successfully decode on target phones
- Fast generation time (< 5 seconds)
- High audio quality and compatibility
- Intuitive user interface
- Cross-platform compatibility 