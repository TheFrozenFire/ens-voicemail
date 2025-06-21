class ENSVoicemailSystem {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioContext = null;
        this.isRecording = false;
        this.recordingStartTime = 0;
        this.recordingTimer = null;
        
        // Enhanced tone encoding configuration
        this.sampleRate = 44100;
        this.toneDuration = 0.08; // 80ms per character (DTMF standard)
        this.silenceDuration = 0.04; // 40ms silence between tones
        
        // DTMF frequency pairs (standard)
        this.dtmfFrequencies = {
            '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
            '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
            '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
            '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633]
        };
        
        // Character to DTMF mapping for hex encoding
        this.charToDTMF = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F'
        };
        
        // Start/stop markers
        this.startMarker = '*';
        this.stopMarker = '#';
        
        this.initializeElements();
        this.bindEvents();
        this.setupLogging();
        this.loadEthers();
    }

    async loadEthers() {
        try {
            // Load ethers.js from CDN if not already loaded
            if (typeof ethers === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js';
                script.onload = () => {
                    console.log('✅ Ethers.js loaded successfully');
                    this.ethersLoaded = true;
                };
                document.head.appendChild(script);
            } else {
                this.ethersLoaded = true;
            }
        } catch (error) {
            console.error('Error loading ethers.js:', error);
        }
    }

    setupLogging() {
        // Override console.log to also send to server
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.sendLogToServer('INFO', args.join(' '));
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.sendLogToServer('ERROR', args.join(' '));
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.sendLogToServer('WARN', args.join(' '));
        };
    }

    async sendLogToServer(level, message) {
        try {
            await fetch('http://localhost:8001/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: level,
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            // Fallback to console if server is not available
            console.log(`[${level}] ${message}`);
        }
    }

    addLogEntry(message, type = 'info') {
        const debugLogs = document.getElementById('debugLogs');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = `[${timestamp}] `;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = `log-message log-${type}`;
        messageSpan.textContent = message;
        
        logEntry.appendChild(timeSpan);
        logEntry.appendChild(messageSpan);
        debugLogs.appendChild(logEntry);
        
        // Auto-scroll to bottom
        debugLogs.scrollTop = debugLogs.scrollHeight;
    }

    initializeElements() {
        // Input elements
        this.ensAddressInput = document.getElementById('ensAddress');
        this.validateENSBtn = document.getElementById('validateENS');
        this.ensStatus = document.getElementById('ensStatus');
        
        // Recording elements
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');
        this.playRecordingBtn = document.getElementById('playRecording');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.recordingTime = document.getElementById('recordingTime');
        
        // Preview elements
        this.generateTonesBtn = document.getElementById('generateTones');
        this.playWithTonesBtn = document.getElementById('playWithTones');
        this.downloadRecordingBtn = document.getElementById('downloadRecording');
        this.displayAddress = document.getElementById('displayAddress');
        this.toneDuration = document.getElementById('toneDuration');
        this.totalLength = document.getElementById('totalLength');
        
        // Decode elements
        this.audioFileInput = document.getElementById('audioFile');
        this.decodeTonesBtn = document.getElementById('decodeTones');
        this.decodeResult = document.getElementById('decodeResult');
    }

    bindEvents() {
        this.validateENSBtn.addEventListener('click', () => this.validateENS());
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        this.playRecordingBtn.addEventListener('click', () => this.playRecording());
        this.generateTonesBtn.addEventListener('click', () => this.generateTones());
        this.playWithTonesBtn.addEventListener('click', () => this.playWithTones());
        this.downloadRecordingBtn.addEventListener('click', () => this.downloadRecording());
        this.decodeTonesBtn.addEventListener('click', () => this.decodeTones());
        
        // Auto-validate ENS on input
        this.ensAddressInput.addEventListener('input', () => this.validateENS());
    }

    async validateENS() {
        const address = this.ensAddressInput.value.trim();
        
        if (!address) {
            this.showStatus('Please enter an ENS address', 'error');
            return false;
        }

        // Basic ENS validation (ends with .eth and has valid characters)
        const ensRegex = /^[a-zA-Z0-9-]+\.eth$/;
        if (!ensRegex.test(address)) {
            this.showStatus('Invalid ENS address format. Must end with .eth and contain only letters, numbers, and hyphens.', 'error');
            return false;
        }

        // Wait for ethers.js to load
        if (!this.ethersLoaded) {
            this.showStatus('Loading ENS resolver...', 'info');
            await new Promise(resolve => {
                const checkEthers = () => {
                    if (this.ethersLoaded) {
                        resolve();
                    } else {
                        setTimeout(checkEthers, 100);
                    }
                };
                checkEthers();
            });
        }

        try {
            this.showStatus('Resolving ENS address...', 'info');
            
            // Create provider (using public Ethereum node)
            const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
            
            // Resolve ENS address
            const resolvedAddress = await provider.resolveName(address);
            
            if (resolvedAddress) {
                this.showStatus(`✅ ENS resolved: ${resolvedAddress}`, 'success');
                this.displayAddress.textContent = `${address} → ${resolvedAddress}`;
                this.resolvedAddress = resolvedAddress;
                return true;
            } else {
                this.showStatus('❌ ENS address not found or not registered', 'error');
                return false;
            }
            
        } catch (error) {
            console.error('ENS resolution error:', error);
            this.showStatus('❌ Error resolving ENS address. Please check your connection.', 'error');
            return false;
        }
    }

    showStatus(message, type) {
        this.ensStatus.textContent = message;
        this.ensStatus.className = `status ${type}`;
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.playRecordingBtn.disabled = false;
                this.generateTonesBtn.disabled = false;
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            this.recordingIndicator.classList.remove('hidden');
            
            this.startRecordingTimer();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            this.isRecording = false;
            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
            this.recordingIndicator.classList.add('hidden');
            
            this.stopRecordingTimer();
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            this.recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    playRecording() {
        if (this.audioBlob) {
            const audioUrl = URL.createObjectURL(this.audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    }

    generateTones() {
        console.log('🎵 Generating tones...');
        if (!this.resolvedAddress) {
            console.log('❌ No resolved ENS address available');
            this.showStatus('Please validate an ENS address first', 'error');
            return;
        }

        console.log('📝 Using resolved address:', this.resolvedAddress);
        
        const tones = this.encodeENSToTones(this.resolvedAddress);
        console.log('🎼 Generated tones:', tones);
        
        // Calculate tone information
        const totalDuration = tones.reduce((sum, tone) => sum + tone.duration, 0);
        
        this.toneDuration.textContent = `${totalDuration.toFixed(1)}s`;
        this.totalLength.textContent = `${totalDuration.toFixed(1)}s`;
        
        this.playWithTonesBtn.disabled = false;
        this.downloadRecordingBtn.disabled = false;
        
        // Store tones for later use
        this.encodedTones = tones;
        
        console.log('✅ Tones generated successfully, playing now...');
        // Auto-play the tones immediately
        this.playTonesOnly(tones);
    }

    playTonesOnly(tones) {
        try {
            // Create audio context for tone generation
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.playTones(tones);
        } catch (error) {
            console.error('Error playing tones:', error);
            alert('Error playing tones. Please try again.');
        }
    }

    encodeENSToTones(address) {
        console.log('🔧 Encoding address to DTMF tones:', address);
        
        // Convert address to hex string (remove 0x prefix)
        const hexAddress = address.replace('0x', '').toLowerCase();
        console.log('📝 Hex address:', hexAddress);
        
        // Create DTMF sequence with start marker, hex data, and stop marker
        const dtmfSequence = [this.startMarker, ...hexAddress.split(''), this.stopMarker];
        console.log('🎼 DTMF sequence:', dtmfSequence);
        
        const tones = [];
        
        dtmfSequence.forEach((char, index) => {
            const dtmfChar = this.charToDTMF[char];
            if (dtmfChar && this.dtmfFrequencies[dtmfChar]) {
                const frequencies = this.dtmfFrequencies[dtmfChar];
                tones.push({
                    frequencies: frequencies,
                    duration: this.toneDuration,
                    character: char,
                    dtmfChar: dtmfChar
                });
                
                // Add silence between tones (except after stop marker)
                if (index < dtmfSequence.length - 1) {
                    tones.push({
                        frequencies: null,
                        duration: this.silenceDuration,
                        character: 'silence',
                        dtmfChar: null
                    });
                }
            } else {
                console.warn(`⚠️ Unsupported character for DTMF: ${char}`);
            }
        });
        
        console.log('✅ Generated tones:', tones.length, 'segments');
        return tones;
    }

    async getAudioDuration(blob) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.onloadedmetadata = () => {
                resolve(audio.duration);
            };
            audio.src = URL.createObjectURL(blob);
        });
    }

    async playWithTones() {
        if (!this.audioBlob || !this.encodedTones) {
            return;
        }

        try {
            // Create audio context for tone generation
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play the original recording
            const audioUrl = URL.createObjectURL(this.audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                // Play the encoded tones after the recording ends
                this.playTones(this.encodedTones);
            };
            
            audio.play();
            
        } catch (error) {
            console.error('Error playing audio with tones:', error);
            alert('Error playing audio. Please try again.');
        }
    }

    playTones(tones) {
        let currentTime = this.audioContext.currentTime;
        
        tones.forEach((tone, index) => {
            if (tone.frequencies) {
                // Create dual-tone DTMF signal
                const oscillator1 = this.audioContext.createOscillator();
                const oscillator2 = this.audioContext.createOscillator();
                const gainNode1 = this.audioContext.createGain();
                const gainNode2 = this.audioContext.createGain();
                const masterGain = this.audioContext.createGain();
                
                // Connect oscillators to their gain nodes
                oscillator1.connect(gainNode1);
                oscillator2.connect(gainNode2);
                
                // Connect gain nodes to master gain
                gainNode1.connect(masterGain);
                gainNode2.connect(masterGain);
                
                // Connect master gain to output
                masterGain.connect(this.audioContext.destination);
                
                // Set frequencies for DTMF dual-tone
                oscillator1.frequency.setValueAtTime(tone.frequencies[0], currentTime);
                oscillator2.frequency.setValueAtTime(tone.frequencies[1], currentTime);
                
                oscillator1.type = 'sine';
                oscillator2.type = 'sine';
                
                // Set individual gains for balanced dual-tone
                gainNode1.gain.setValueAtTime(0.2, currentTime);
                gainNode2.gain.setValueAtTime(0.2, currentTime);
                
                // Master gain envelope to avoid clicks
                masterGain.gain.setValueAtTime(0, currentTime);
                masterGain.gain.linearRampToValueAtTime(0.5, currentTime + 0.01);
                masterGain.gain.linearRampToValueAtTime(0.5, currentTime + tone.duration - 0.01);
                masterGain.gain.linearRampToValueAtTime(0, currentTime + tone.duration);
                
                // Start and stop oscillators
                oscillator1.start(currentTime);
                oscillator2.start(currentTime);
                oscillator1.stop(currentTime + tone.duration);
                oscillator2.stop(currentTime + tone.duration);
                
                console.log(`🎵 Playing DTMF ${tone.dtmfChar} (${tone.frequencies[0]}Hz + ${tone.frequencies[1]}Hz) for ${tone.duration}s`);
            } else {
                // Silence segment
                console.log(`🔇 Silence for ${tone.duration}s`);
            }
            
            currentTime += tone.duration;
        });
    }

    async downloadRecording() {
        if (!this.audioBlob || !this.encodedTones) {
            return;
        }

        try {
            // Combine original recording with tones
            const combinedAudio = await this.combineAudioWithTones();
            
            // Create download link
            const url = URL.createObjectURL(combinedAudio);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voicemail-${this.ensAddressInput.value.trim()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading recording:', error);
            alert('Error creating download. Please try again.');
        }
    }

    async combineAudioWithTones() {
        if (!this.audioBlob || !this.encodedTones) {
            throw new Error('No audio recording or tones available');
        }

        try {
            // Create audio context for processing
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Decode the recorded audio
            const arrayBuffer = await this.audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Calculate total duration
            const recordingDuration = audioBuffer.duration;
            const tonesDuration = this.encodedTones.reduce((sum, tone) => sum + tone.duration, 0);
            const totalDuration = recordingDuration + tonesDuration;
            
            // Create output buffer
            const outputBuffer = audioContext.createBuffer(1, Math.ceil(totalDuration * audioContext.sampleRate), audioContext.sampleRate);
            const outputChannel = outputBuffer.getChannelData(0);
            
            // Copy recorded audio to output
            const recordingChannel = audioBuffer.getChannelData(0);
            for (let i = 0; i < recordingChannel.length; i++) {
                outputChannel[i] = recordingChannel[i];
            }
            
            // Generate and add DTMF tones after the recording
            let toneStartTime = recordingDuration;
            
            this.encodedTones.forEach(tone => {
                if (tone.frequencies) {
                    // Generate DTMF tone
                    const toneSamples = Math.ceil(tone.duration * audioContext.sampleRate);
                    const startSample = Math.floor(toneStartTime * audioContext.sampleRate);
                    
                    for (let i = 0; i < toneSamples; i++) {
                        const time = (i / audioContext.sampleRate);
                        const sample1 = Math.sin(2 * Math.PI * tone.frequencies[0] * time);
                        const sample2 = Math.sin(2 * Math.PI * tone.frequencies[1] * time);
                        const combinedSample = (sample1 + sample2) * 0.3; // Reduce volume
                        
                        if (startSample + i < outputChannel.length) {
                            outputChannel[startSample + i] += combinedSample;
                        }
                    }
                }
                toneStartTime += tone.duration;
            });
            
            // Convert buffer to blob
            const wavBlob = this.audioBufferToWav(outputBuffer);
            return wavBlob;
            
        } catch (error) {
            console.error('Error combining audio:', error);
            throw error;
        }
    }

    audioBufferToWav(buffer) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // Convert audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    async decodeTones() {
        const file = this.audioFileInput.files[0];
        if (!file) {
            alert('Please select an audio file to decode.');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const decodedAddress = this.decodeTonesFromAudio(audioBuffer);
            
            if (decodedAddress) {
                this.decodeResult.textContent = `Decoded ENS Address: ${decodedAddress}`;
            } else {
                this.decodeResult.textContent = 'No valid ENS address found in the audio.';
            }
            
        } catch (error) {
            console.error('Error decoding tones:', error);
            this.decodeResult.textContent = 'Error decoding audio file. Please ensure it contains valid ENS tones.';
        }
    }

    decodeTonesFromAudio(audioBuffer) {
        console.log('🔍 Decoding DTMF tones from audio...');
        
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        
        // Detect DTMF tones using FFT analysis
        const dtmfSequence = this.detectDTMFTones(channelData, sampleRate);
        console.log('📝 Detected DTMF sequence:', dtmfSequence);
        
        // Convert DTMF sequence to hex address
        const hexAddress = this.dtmfToHex(dtmfSequence);
        console.log('🔢 Decoded hex address:', hexAddress);
        
        if (hexAddress && hexAddress.length === 40) {
            return '0x' + hexAddress;
        } else {
            console.warn('⚠️ Invalid hex address length:', hexAddress?.length);
            return null;
        }
    }

    detectDTMFTones(channelData, sampleRate) {
        const dtmfSequence = [];
        const windowSize = Math.floor(sampleRate * this.toneDuration);
        const fftSize = 2048;
        
        // DTMF frequency ranges for detection
        const rowFreqs = [697, 770, 852, 941];
        const colFreqs = [1209, 1336, 1477, 1633];
        const tolerance = 50; // Hz tolerance for frequency detection
        
        for (let i = 0; i < channelData.length; i += windowSize) {
            const window = channelData.slice(i, i + windowSize);
            
            // Skip silence segments
            const rms = Math.sqrt(window.reduce((sum, sample) => sum + sample * sample, 0) / window.length);
            if (rms < 0.01) {
                continue;
            }
            
            // Perform FFT analysis
            const frequencies = this.performFFT(window, sampleRate, fftSize);
            
            // Detect DTMF frequencies
            const detectedRow = this.findClosestFrequency(frequencies, rowFreqs, tolerance);
            const detectedCol = this.findClosestFrequency(frequencies, colFreqs, tolerance);
            
            if (detectedRow && detectedCol) {
                const dtmfChar = this.frequenciesToDTMF(detectedRow, detectedCol);
                if (dtmfChar) {
                    dtmfSequence.push(dtmfChar);
                }
            }
        }
        
        return dtmfSequence;
    }

    performFFT(window, sampleRate, fftSize) {
        // Simple FFT implementation for frequency detection
        const frequencies = [];
        const step = sampleRate / fftSize;
        
        for (let k = 0; k < fftSize / 2; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < window.length; n++) {
                const angle = -2 * Math.PI * k * n / fftSize;
                real += window[n] * Math.cos(angle);
                imag += window[n] * Math.sin(angle);
            }
            
            const magnitude = Math.sqrt(real * real + imag * imag);
            if (magnitude > 0.1) { // Threshold for significant frequencies
                frequencies.push({
                    frequency: k * step,
                    magnitude: magnitude
                });
            }
        }
        
        return frequencies.sort((a, b) => b.magnitude - a.magnitude);
    }

    findClosestFrequency(frequencies, targetFreqs, tolerance) {
        for (const freq of frequencies) {
            for (const target of targetFreqs) {
                if (Math.abs(freq.frequency - target) <= tolerance) {
                    return target;
                }
            }
        }
        return null;
    }

    frequenciesToDTMF(rowFreq, colFreq) {
        // Reverse lookup from frequencies to DTMF character
        for (const [char, freqs] of Object.entries(this.dtmfFrequencies)) {
            if (freqs[0] === rowFreq && freqs[1] === colFreq) {
                return char;
            }
        }
        return null;
    }

    dtmfToHex(dtmfSequence) {
        // Remove start and stop markers
        const filteredSequence = dtmfSequence.filter(char => char !== this.startMarker && char !== this.stopMarker);
        
        // Convert DTMF characters to hex
        const hexChars = [];
        for (const dtmfChar of filteredSequence) {
            const hexChar = this.dtmfToHexChar(dtmfChar);
            if (hexChar) {
                hexChars.push(hexChar);
            }
        }
        
        return hexChars.join('');
    }

    dtmfToHexChar(dtmfChar) {
        // Reverse mapping from DTMF to hex
        for (const [hex, dtmf] of Object.entries(this.charToDTMF)) {
            if (dtmf === dtmfChar) {
                return hex;
            }
        }
        return null;
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ENSVoicemailSystem();
});
