# ENS Voicemail Audio Generator - Development Plan

## Project Overview
Build an application that generates audio clips containing DTMF (Dual-Tone Multi-Frequency) tones to transmit ENS (Ethereum Name Service) addresses via phone. These audio clips can be embedded in voicemail messages, allowing recipients with compatible phones to decode the ENS address like an audio QR code.

## KPI and Metrics Framework

### Core Principle: Measure Everything
**Always define success metrics first, build measurement infrastructure, and incorporate metric validation into every development cycle.**

### 1. **Success Metrics Definition**
Before implementing any feature, define 3-5 specific, measurable KPIs:
- **Technical Metrics**: Performance, reliability, accuracy
- **User Experience Metrics**: Usability, completion rates, error recovery
- **Business Metrics**: Adoption, usage patterns, user satisfaction

### 2. **Measurement Infrastructure Requirements**
- **Automated Testing**: Unit tests that validate KPI thresholds
- **Real-time Monitoring**: Logging and metric collection
- **Performance Profiling**: Timing and resource usage tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: Usage patterns and interaction tracking

### 3. **Continuous Development Integration**
- **Pre-commit Validation**: Run metric checks before code commits
- **CI/CD Pipeline**: Automated metric validation in build process
- **Regression Detection**: Alerts when metrics degrade
- **Baseline Tracking**: Document and track metric improvements over time

### 4. **ENS Voicemail Specific KPIs**

#### Technical Performance KPIs:
- **DTMF Encoding Accuracy**: > 95% (measured against known fixtures)
- **DTMF Decoding Accuracy**: > 90% (measured with real phone tests)
- **Audio Generation Time**: < 2 seconds for standard ENS addresses
- **Cross-browser Compatibility**: 100% (Chrome, Firefox, Safari)
- **Test Coverage**: > 80% of critical functions
- **Error Recovery Rate**: > 95% successful recovery from failures

#### User Experience KPIs:
- **Time to Generate Voicemail**: < 30 seconds end-to-end
- **ENS Resolution Success Rate**: > 90% for valid addresses
- **User Error Rate**: < 5% (successful completion without errors)
- **Mobile Responsiveness**: 100% functional on mobile devices
- **Accessibility Compliance**: WCAG 2.1 AA standards

#### Quality Assurance KPIs:
- **Fixture Test Pass Rate**: 100% (all generated fixtures decode correctly)
- **Real Phone Test Success**: > 85% (actual phone/voicemail decoding)
- **Performance Regression**: < 10% degradation in any metric
- **Security Compliance**: Zero critical vulnerabilities

### 5. **Measurement Implementation**

#### Automated Metric Collection:
```javascript
// Example metric collection in code
const metrics = {
  dtmfAccuracy: measureDecodingAccuracy(fixtures),
  generationTime: measureGenerationTime(ensAddress),
  errorRate: calculateErrorRate(userInteractions),
  performanceScore: calculatePerformanceScore()
};
```

#### Metric Validation in Development:
- **Unit Tests**: Validate individual function performance
- **Integration Tests**: End-to-end metric validation
- **Performance Tests**: Automated performance regression detection
- **Fixture Tests**: Validate DTMF encoding/decoding accuracy

#### Continuous Monitoring:
- **Real-time Dashboards**: Live metric visualization
- **Alert Systems**: Notify when metrics fall below thresholds
- **Trend Analysis**: Track metric improvements over time
- **Regression Detection**: Automated detection of performance degradation

### 6. **Development Workflow with Metrics**

#### Before Feature Development:
1. **Define Success Metrics**: What does success look like?
2. **Set Baselines**: Current performance levels
3. **Establish Targets**: Specific improvement goals
4. **Plan Measurement**: How will we measure success?

#### During Development:
1. **Implement Metrics**: Add measurement code
2. **Validate Continuously**: Run metric checks frequently
3. **Track Progress**: Monitor metric improvements
4. **Adjust Targets**: Refine goals based on data

#### After Feature Completion:
1. **Measure Results**: Compare against targets
2. **Document Learnings**: What worked, what didn't
3. **Update Baselines**: Set new performance standards
4. **Plan Next Iteration**: Identify next improvement opportunities

### 7. **Metric Documentation Requirements**

#### METRICS.md File Structure:
```markdown
# Project Metrics Dashboard

## Current KPIs
- [Metric Name]: [Current Value] / [Target] - [Status]
- [Trend]: [Improving/Stable/Declining]

## Measurement Methodology
- [How each metric is calculated]
- [Tools and frameworks used]
- [Data collection frequency]

## Historical Performance
- [Baseline dates and values]
- [Improvement milestones]
- [Performance trends]

## Action Items
- [Specific actions to improve metrics]
- [Ownership and timelines]
- [Success criteria]
```

### 8. **Quality Gates and Validation**

#### Pre-deployment Checks:
- All KPI thresholds must be met
- Performance regression tests must pass
- Security scans must be clean
- Test coverage must meet minimum requirements

#### Post-deployment Validation:
- Monitor real-world metric performance
- Compare against pre-deployment baselines
- Alert on any metric degradation
- Document learnings for future improvements

### 9. **Continuous Improvement Process**

#### Weekly Metric Review:
- Analyze metric trends and patterns
- Identify improvement opportunities
- Adjust targets based on learnings
- Plan next week's metric focus

#### Monthly KPI Assessment:
- Review all KPIs against targets
- Identify systemic issues or patterns
- Update measurement methodology if needed
- Set new quarterly targets

#### Quarterly Framework Evaluation:
- Assess metric framework effectiveness
- Add/remove/modify KPIs as needed
- Update measurement tools and processes
- Plan next quarter's metric strategy

---

## Development Workflow with TODO.md

### How to Use TODO.md Effectively

The `TODO.md` file serves as your primary task management system during development. Here's how to use it effectively:

- **Note for AI Assistants:**
  - Do not ask for user permission before proceeding with the next logical step. Autonomously continue with the highest priority task unless the user explicitly interrupts or redirects you.
  - **Update TODO.md automatically** as tasks are completed, bugs are found, or priorities change. Keep the TODO.md in sync with the actual project status at all times.

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

## Server Lock File Mechanism

To prevent multiple server instances and port conflicts, the server now creates a lock file (`server.lock`) and a PID file (`server.pid`) when started. These files are automatically cleaned up when the server is stopped, even on SIGINT/SIGTERM. If you try to start the server while it's already running, you'll get a clear message and the server won't start again.

### Usage

- To start the server:
  ```sh
  ./start_server.sh
  ```
- To stop the server:
  ```sh
  ./stop_server.sh
  ```

The scripts handle lock file creation, cleanup, and graceful shutdown. If the server crashes or is killed, stale lock files are detected and cleaned up on the next start.

**Note:** The lock files and logs are excluded from version control via `.gitignore`. 