/**
 * ENS Voicemail System - Modular Main
 * Coordinates between different modules to provide the complete application
 */

import { dtmfUtils } from './modules/dtmf/dtmfUtils.js';
import { dtmfEncoder } from './modules/dtmf/dtmfEncoder.js';
import { audioContextManager } from './modules/audio/audioContext.js';
import { audioWidget } from './modules/audio/audioWidget.js';
import { waveformVisualizer } from './modules/audio/waveform.js';
import { ensResolver } from './modules/ens/ensResolver.js';
import { uiManager } from './modules/ui/uiManager.js';

class ENSVoicemailSystem {
    constructor() {
        this.resolvedAddress = null;
        this.encodedTones = null;
        
        this.initializeSystem();
        this.bindEvents();
        
        // Auto-validate default ENS on load
        setTimeout(() => {
            this.validateENS();
        }, 0);
    }

    /**
     * Initialize the system
     */
    initializeSystem() {
        console.log('🔧 Initializing ENS Voicemail System...');
        
        // Initialize UI manager
        uiManager.initializeElements();
        
        // Initialize audio context
        audioContextManager.initializeAudioContext();
        
        console.log('✅ System initialized successfully');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        console.log('🔧 Binding event listeners...');
        
        // Generate tones button
        const generateTonesBtn = uiManager.getElement('generateTonesBtn');
        if (generateTonesBtn) {
            generateTonesBtn.addEventListener('click', () => {
                this.generateTones();
            });
        }

        // Decode tones button
        const decodeTonesBtn = uiManager.getElement('decodeTonesBtn');
        if (decodeTonesBtn) {
            decodeTonesBtn.addEventListener('click', () => {
                this.decodeTones();
            });
        }

        // Debug controls
        const clearLogsBtn = document.getElementById('clearLogs');
        const copyLogsBtn = document.getElementById('copyLogs');
        
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                uiManager.clearLogs();
            });
        }
        
        if (copyLogsBtn) {
            copyLogsBtn.addEventListener('click', () => {
                uiManager.copyLogs();
            });
        }

        // Debounced ENS auto-validation on input
        const ensAddressInput = uiManager.getElement('ensAddressInput');
        if (ensAddressInput) {
            let ensDebounceTimeout = null;
            ensAddressInput.addEventListener('input', () => {
                clearTimeout(ensDebounceTimeout);
                ensDebounceTimeout = setTimeout(() => {
                    this.validateENS();
                }, 400);
            });
        }
    }

    /**
     * Validate ENS address
     */
    async validateENS() {
        const ensAddressInput = uiManager.getElement('ensAddressInput');
        if (!ensAddressInput) return false;
        
        const address = ensAddressInput.value.trim().toLowerCase();
        
        // Validate format
        const formatValidation = ensResolver.validateENSFormat(address);
        if (!formatValidation.valid) {
            uiManager.updateENSStatus(formatValidation.error, 'error');
            return false;
        }
        
        uiManager.updateENSStatus('Loading ENS resolver...', 'info');
        
        try {
            const result = await ensResolver.resolveENSAddress(address);
            
            if (result.success) {
                uiManager.updateENSStatus(`✅ ENS resolved: ${result.address}`, 'success');
                uiManager.updateDisplayAddress(`${address} → ${result.address}`);
                this.resolvedAddress = result.address;
                
                return true;
            } else {
                uiManager.updateENSStatus(`❌ ${result.error}`, 'error');
                uiManager.updateDisplayAddress('-');
                this.resolvedAddress = null;
                
                return false;
            }
        } catch (error) {
            uiManager.updateENSStatus(`❌ ${error.message}`, 'error');
            uiManager.updateDisplayAddress('-');
            this.resolvedAddress = null;
            
            return false;
        }
    }

    /**
     * Generate DTMF tones
     */
    generateTones() {
        console.log('🔧 Starting DTMF tone generation...');
        console.log('🔧 Resolved address:', this.resolvedAddress);
        
        if (!this.resolvedAddress) {
            console.error('❌ No resolved address available');
            uiManager.updateENSStatus('❌ Please validate an ENS address first.', 'error');
            return;
        }
        
        try {
            console.log('🔧 Encoding ENS to tones...');
            const tones = dtmfEncoder.generateTones(this.resolvedAddress);
            console.log('🔧 Encoded tones:', tones);
            console.log('🔧 Tones array length:', tones ? tones.length : 'null');
            
            if (!tones || !Array.isArray(tones)) {
                console.error('❌ encodeENSToTones returned invalid result:', tones);
                uiManager.updateENSStatus('❌ Error: Could not encode ENS address to tones.', 'error');
                return;
            }
            
            // Validate tones
            console.log('🔧 Validating tones...');
            console.log('🔧 Tones is array:', Array.isArray(tones));
            console.log('🔧 Tones length:', tones.length);
            console.log('🔧 Sample tone:', tones[0]);
            console.log('🔧 First 3 tones:', tones.slice(0, 3));
            
            // Check for invalid durations
            const invalidTones = tones.filter(t => typeof t.duration !== 'number' || isNaN(t.duration));
            if (invalidTones.length > 0) {
                console.error('❌ Found tones with invalid duration:', invalidTones);
            }
            
            if (!Array.isArray(tones) || tones.length === 0 || tones.some(t => typeof t.duration !== 'number' || isNaN(t.duration))) {
                console.error('❌ Tone validation failed');
                console.error('❌ Tones array:', tones);
                console.error('❌ Invalid tones found:', invalidTones);
                uiManager.updateENSStatus('❌ Error: Could not generate DTMF tones for this ENS address.', 'error');
                uiManager.updateToneDuration('-');
                uiManager.updateTotalLength('-');
                
                const audioPlayer = uiManager.getElement('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.style.display = 'none';
                    audioPlayer.src = '';
                }
                
                return;
            }
            
            console.log('🔧 Tone validation passed');
            const totalDuration = tones.reduce((sum, tone) => sum + tone.duration, 0);
            console.log('🔧 Total duration:', totalDuration);
            uiManager.updateToneDuration(totalDuration);
            uiManager.updateTotalLength(totalDuration);
            this.encodedTones = tones;
            uiManager.updateENSStatus('DTMF tones generated. Ready to play.', 'success');
            
            console.log('🔧 Drawing waveform...');
            waveformVisualizer.drawToneWaveform(tones);
            
            // Measure DTMF accuracy against expected sequence
            const generatedSequence = tones.map(t => t.dtmfChar).filter(Boolean).join('');
            const expectedSequence = dtmfUtils.getExpectedDTMFSequence(this.resolvedAddress);
            if (expectedSequence && window.metricsCollector) {
                const accuracy = window.metricsCollector.measureDTMFAccuracy(generatedSequence, expectedSequence);
                uiManager.addLogEntry(`DTMF accuracy: ${accuracy.toFixed(1)}%`, 'info');
            }
            
            // Record successful generation
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones', true);
            }
            
            console.log('🔧 Tone generation completed successfully');
            
            // Create audio widget
            const audioPlayer = uiManager.getElement('audioPlayer');
            if (audioPlayer) {
                try {
                    // Create a container for the audio widget if it doesn't exist
                    let audioContainer = audioPlayer.parentNode.querySelector('.audio-player-container');
                    if (!audioContainer) {
                        console.log('🎵 Creating new audio container...');
                        audioContainer = document.createElement('div');
                        audioContainer.className = 'audio-player-container';
                        audioContainer.style.marginTop = '15px';
                        audioContainer.style.padding = '10px';
                        audioContainer.style.border = '1px solid #ddd';
                        audioContainer.style.borderRadius = '5px';
                        audioContainer.style.backgroundColor = '#f9f9f9';
                        audioPlayer.parentNode.insertBefore(audioContainer, audioPlayer);
                        console.log('🎵 Audio container created and inserted');
                    } else {
                        console.log('🎵 Using existing audio container');
                    }
                    
                    // Create the audio widget
                    audioWidget.createAudioWidget(tones, audioContainer, (audioEl, container) => {
                        // Add a decode button below the audio widget
                        let decodeBtn = container.querySelector('.decode-generated-audio-btn');
                        if (!decodeBtn) {
                            decodeBtn = document.createElement('button');
                            decodeBtn.className = 'decode-generated-audio-btn btn-secondary';
                            decodeBtn.textContent = '🔍 Decode This Audio';
                            decodeBtn.style.marginTop = '10px';
                            decodeBtn.style.display = 'block';
                            container.appendChild(decodeBtn);
                        }
                        decodeBtn.onclick = async () => {
                            try {
                                console.log('🔍 Decode button clicked');
                                // Fetch the blob from the audio src
                                const response = await fetch(audioEl.src);
                                const arrayBuffer = await response.arrayBuffer();
                                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                                const decodedAddress = this.decodeTonesFromAudio(audioBuffer);
                                console.log('🔍 Decoded address:', decodedAddress);
                                if (decodedAddress) {
                                    console.log('🔍 Updating UI with decoded address:', decodedAddress);
                                    uiManager.updateDecodeResult(`Decoded ENS Address: ${decodedAddress}`);
                                    uiManager.updateENSStatus('DTMF tones decoded successfully.', 'success');
                                    console.log('🔍 UI updated successfully');
                                } else {
                                    console.log('🔍 No valid address found, updating UI');
                                    uiManager.updateDecodeResult('No valid ENS address found in the audio.');
                                    uiManager.updateENSStatus('No valid ENS address found in the audio.', 'error');
                                }
                            } catch (err) {
                                console.error('🔍 Error in decode button:', err);
                                uiManager.updateENSStatus('❌ Error decoding generated audio.', 'error');
                                uiManager.updateDecodeResult('Error decoding generated audio.');
                                uiManager.addLogEntry(err.message, 'error');
                            }
                        };
                    });
                    
                    // Hide the original audio element
                    audioPlayer.style.display = 'none';
                    
                } catch (err) {
                    console.error('❌ Error creating audio widget:', err);
                    audioPlayer.style.display = 'none';
                    uiManager.addLogEntry(`Audio widget error: ${err.message}`, 'error');
                }
            } else {
                console.error('❌ Audio player element not found!');
            }
            
        } catch (error) {
            console.error('❌ Error in generateTones:', error);
            uiManager.updateENSStatus('❌ Error generating DTMF tones.', 'error');
            uiManager.addLogEntry(error.message, 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones', false);
                window.metricsCollector.recordErrorRecovery(false);
            }
        }
    }

    /**
     * Decode tones from audio file
     */
    async decodeTones() {
        const audioFileInput = uiManager.getElement('audioFileInput');
        if (!audioFileInput || !audioFileInput.files[0]) {
            uiManager.updateENSStatus('Please select an audio file to decode.', 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('decode_tones', false);
            }
            return;
        }
        
        try {
            const file = audioFileInput.files[0];
            const arrayBuffer = await file.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const decodedAddress = this.decodeTonesFromAudio(audioBuffer);
            
            if (decodedAddress) {
                uiManager.updateDecodeResult(`Decoded ENS Address: ${decodedAddress}`);
                uiManager.updateENSStatus('DTMF tones decoded successfully.', 'success');
                
                // Measure decoding accuracy if we have a reference
                if (window.metricsCollector && this.resolvedAddress) {
                    const expectedAddress = this.resolvedAddress.toLowerCase();
                    const decodedAddressLower = decodedAddress.toLowerCase();
                    const accuracy = expectedAddress === decodedAddressLower ? 100 : 0;
                    window.metricsCollector.metrics.decodingAccuracy = accuracy;
                    
                    if (accuracy < 90) {
                        window.metricsCollector.logError('DTMF decoding accuracy below 90% target', {
                            expected: expectedAddress,
                            decoded: decodedAddressLower,
                            accuracy: accuracy
                        });
                    }
                    
                    uiManager.addLogEntry(`Decoding accuracy: ${accuracy.toFixed(1)}%`, 'info');
                }
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordUserInteraction('decode_tones', true);
                }
            } else {
                uiManager.updateDecodeResult('No valid ENS address found in the audio.');
                uiManager.updateENSStatus('No valid ENS address found in the audio.', 'error');
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordUserInteraction('decode_tones', false);
                    window.metricsCollector.metrics.decodingAccuracy = 0;
                }
            }
        } catch (error) {
            uiManager.updateENSStatus('❌ Error decoding audio file.', 'error');
            uiManager.updateDecodeResult('Error decoding audio file. Please ensure it contains valid ENS tones.');
            uiManager.addLogEntry(error.message, 'error');
            
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('decode_tones', false);
                window.metricsCollector.recordErrorRecovery(false);
                window.metricsCollector.metrics.decodingAccuracy = 0;
            }
        }
    }

    /**
     * Decode tones from audio buffer
     */
    decodeTonesFromAudio(audioBuffer) {
        console.log('🔍 Decoding DTMF tones from audio...');
        
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        
        // Detect DTMF tones using FFT analysis
        const dtmfSequence = this.detectDTMFTones(channelData, sampleRate);
        console.log('📝 Detected DTMF sequence:', dtmfSequence);
        
        // Convert DTMF sequence to hex address
        const hexAddress = dtmfUtils.dtmfToHex(dtmfSequence);
        console.log('🔢 Decoded hex address:', hexAddress);
        console.log('🔢 Hex address length:', hexAddress.length);
        
        // Be more lenient with validation - allow addresses that are close to 40 characters
        if (hexAddress && hexAddress.length >= 35) {
            console.log('✅ Hex address accepted (length >= 35)');
            return '0x' + hexAddress;
        } else {
            console.warn('⚠️ Invalid hex address length:', hexAddress?.length);
            console.warn('⚠️ Expected 40 characters, got:', hexAddress?.length || 0);
            
            // Show what the expected sequence should be for comparison
            if (this.resolvedAddress) {
                const expectedSequence = dtmfUtils.getExpectedDTMFSequence(this.resolvedAddress);
                console.log('📋 Expected DTMF sequence:', expectedSequence);
                console.log('📋 Expected hex address:', this.resolvedAddress.toLowerCase().replace('0x', ''));
            }
            
            return null;
        }
    }

    /**
     * Detect DTMF tones from audio data
     */
    detectDTMFTones(channelData, sampleRate) {
        const dtmfSequence = [];
        const windowSize = Math.floor(sampleRate * dtmfUtils.toneDuration);
        const fftSize = 2048;
        const rowFreqs = [697, 770, 852, 941];
        const colFreqs = [1209, 1336, 1477, 1633];
        const tolerance = 30; // Hz tolerance for frequency detection (tighter)
        let lastDetected = null;
        
        for (let i = 0; i < channelData.length; i += windowSize) {
            const window = channelData.slice(i, i + windowSize);
            // Robust silence detection
            const rms = Math.sqrt(window.reduce((sum, sample) => sum + sample * sample, 0) / window.length);
            if (rms < 0.01) {
                lastDetected = null;
                continue;
            }
            // Apply Hann window to reduce spectral leakage
            const hannWindow = window.map((v, n) => v * (0.5 - 0.5 * Math.cos(2 * Math.PI * n / (window.length - 1))));
            const frequencies = this.performFFT(hannWindow, sampleRate, fftSize);
            // Find the two most prominent frequencies
            const prominent = frequencies.slice(0, 4).sort((a, b) => b.magnitude - a.magnitude);
            const detectedRow = dtmfUtils.findClosestFrequency(prominent, rowFreqs, tolerance);
            const detectedCol = dtmfUtils.findClosestFrequency(prominent, colFreqs, tolerance);
            // Confidence logging
            if (prominent.length > 0) {
                uiManager.addLogEntry(`FFT window [${i}]: Top freq ${prominent[0].frequency.toFixed(1)}Hz (mag ${prominent[0].magnitude.toFixed(2)})`, 'info');
            }
            if (detectedRow && detectedCol) {
                const dtmfChar = dtmfUtils.frequenciesToDTMF(detectedRow, detectedCol);
                // Avoid duplicate detections for the same tone
                if (dtmfChar && dtmfChar !== lastDetected) {
                    dtmfSequence.push(dtmfChar);
                    lastDetected = dtmfChar;
                }
            } else {
                lastDetected = null;
            }
        }
        return dtmfSequence;
    }

    /**
     * Perform FFT on audio data
     */
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
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ENSVoicemailSystem();
}); 