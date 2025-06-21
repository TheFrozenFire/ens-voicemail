class ENSVoicemailSystem {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.ethersLoaded = false;
        this.ethersLoadingPromise = null;
        this.resolvedAddress = null;
        this.generatedTones = null;
        this.toneCache = new Map(); // Cache for DTMF tone arrays by ENS address
        this.bufferCache = new Map(); // Cache for rendered audio buffers by ENS address
        this.maxCacheSize = 10; // Maximum number of cached items
        
        // Enhanced tone encoding configuration
        this.sampleRate = 44100;
        this.toneDuration = 0.08; // 80ms per character (DTMF standard)
        this.silenceDuration = 0.04; // 40ms silence between tones
        
        // DTMF frequency pairs (standard)
        this.dtmfFrequencies = {
            '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
            '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
            '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
            '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633],
            'E': [941, 1633], 'F': [941, 1633] // Extended hex support
        };
        
        // Character to DTMF mapping for hex encoding (A-F for a-f)
        this.charToDTMF = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9',
            'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
            // Also support uppercase for robustness
            'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F'
        };
        
        // Start/stop markers
        this.startMarker = '*';
        this.stopMarker = '#';
        
        this.initializeElements();
        this.initializeAudioContext();
        this.bindEvents();
        this.setupLogging();
        this.loadEthers();
        this.initializeMetrics();
    }

    initializeMetrics() {
        // Initialize metrics dashboard
        this.updateMetricsDisplay();
        this.updateKPIValidation();
        
        // Set up periodic metrics refresh
        setInterval(() => {
            this.updateMetricsDisplay();
            this.updateKPIValidation();
        }, 5000); // Update every 5 seconds
    }

    updateMetricsDisplay() {
        if (!window.metricsCollector) return;
        
        const metrics = window.metricsCollector.getMetrics();
        
        // Update metric values in UI
        document.getElementById('metricGenTime').textContent = metrics.avgGenerationTime;
        document.getElementById('metricEncodingAcc').textContent = metrics.encodingAccuracy;
        document.getElementById('metricDecodingAcc').textContent = metrics.decodingAccuracy;
        document.getElementById('metricUserInteractions').textContent = metrics.userInteractions;
        document.getElementById('metricErrorRate').textContent = metrics.errorRate;
        document.getElementById('metricENSResolution').textContent = metrics.ensResolutionRate;
        document.getElementById('metricFixturePass').textContent = metrics.fixturePassRate;
        document.getElementById('metricCrossBrowser').textContent = metrics.crossBrowserRate;
        document.getElementById('metricErrorRecovery').textContent = metrics.errorRecoveryRate;
        document.getElementById('metricSessionId').textContent = metrics.sessionId.substring(0, 20) + '...';
        document.getElementById('metricSessionDuration').textContent = this.formatDuration(metrics.sessionDuration);
        document.getElementById('metricTotalErrors').textContent = metrics.totalErrors;
        
        // Add warning/error styling based on thresholds
        this.updateMetricStyling('metricGenTime', parseFloat(metrics.avgGenerationTime), 2000, '>');
        this.updateMetricStyling('metricEncodingAcc', parseFloat(metrics.encodingAccuracy), 95, '<');
        this.updateMetricStyling('metricErrorRate', parseFloat(metrics.errorRate), 5, '>');
        this.updateMetricStyling('metricENSResolution', parseFloat(metrics.ensResolutionRate), 90, '<');
    }

    updateMetricStyling(elementId, value, threshold, operator) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.remove('warning', 'error');
        
        let shouldWarn = false;
        if (operator === '>') {
            shouldWarn = value > threshold;
        } else if (operator === '<') {
            shouldWarn = value < threshold;
        }
        
        if (shouldWarn) {
            element.classList.add('error');
        } else if (operator === '>' && value > threshold * 0.8) {
            element.classList.add('warning');
        } else if (operator === '<' && value < threshold * 1.2) {
            element.classList.add('warning');
        }
    }

    updateKPIValidation() {
        if (!window.metricsCollector) return;
        
        const validation = window.metricsCollector.validateKPIs();
        const kpiStatus = document.getElementById('kpiStatus');
        kpiStatus.innerHTML = '';
        
        if (validation.valid) {
            const successItem = document.createElement('div');
            successItem.className = 'kpi-item success';
            successItem.innerHTML = `
                <span class="kpi-icon">✅</span>
                <span class="kpi-message">All KPIs are within target thresholds</span>
            `;
            kpiStatus.appendChild(successItem);
        } else {
            validation.violations.forEach(violation => {
                const errorItem = document.createElement('div');
                errorItem.className = 'kpi-item error';
                errorItem.innerHTML = `
                    <span class="kpi-icon">❌</span>
                    <span class="kpi-message">${violation}</span>
                `;
                kpiStatus.appendChild(errorItem);
            });
        }
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    initializeAudioContext() {
        try {
            if (!this.audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.addLogEntry('Audio context initialized successfully', 'info');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            this.addLogEntry(`Audio context initialization failed: ${error.message}`, 'error');
            this.showStatus('❌ Audio system not available. Please check browser permissions.', 'error');
        }
    }

    async loadEthers() {
        // Returns a promise that resolves when ethers is loaded
        if (this.ethersLoaded) return Promise.resolve();
        if (this.ethersLoadingPromise) return this.ethersLoadingPromise;
        
        const tryLoadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = false;
                script.onload = () => {
                    if (typeof ethers !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('Ethers.js loaded but not available'));
                    }
                };
                script.onerror = (e) => {
                    reject(new Error('Failed to load ' + src));
                };
                document.head.appendChild(script);
            });
        };
        
        this.ethersLoadingPromise = new Promise(async (resolve, reject) => {
            // Check if ethers is already available
            if (typeof ethers !== 'undefined') {
                this.ethersLoaded = true;
                resolve();
                return;
            }
            // Try CDN first
            try {
                await tryLoadScript('https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js');
                if (typeof ethers !== 'undefined') {
                    this.ethersLoaded = true;
                    resolve();
                    return;
                }
            } catch (e) {
                // Try local fallback
                try {
                    await tryLoadScript('js/ethers-5.7.2.umd.min.js');
                    if (typeof ethers !== 'undefined') {
                        this.ethersLoaded = true;
                        resolve();
                        return;
                    }
                } catch (e2) {
                    this.ethersLoaded = false;
                    reject(new Error('Failed to load ethers.js from CDN and local fallback.'));
                    return;
                }
            }
            // If still not loaded
            if (typeof ethers === 'undefined') {
                this.ethersLoaded = false;
                reject(new Error('Ethers.js not available after all attempts.'));
            }
        });
        return this.ethersLoadingPromise;
    }

    setupLogging() {
        // Vite development server - no need for custom logging override
        console.log('📝 Logging system initialized (Vite development mode)');
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
        this.validateENSBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('validate_ens_click');
            }
            this.validateENS();
        });
        
        this.startRecordingBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('start_recording_click');
            }
            this.startRecording();
        });
        
        this.stopRecordingBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('stop_recording_click');
            }
            this.stopRecording();
        });
        
        this.playRecordingBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('play_recording_click');
            }
            this.playRecording();
        });
        
        this.generateTonesBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones_click');
            }
            this.generateTones();
        });
        
        this.playWithTonesBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('play_with_tones_click');
            }
            this.playWithTones();
        });
        
        this.downloadRecordingBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('download_recording_click');
            }
            this.downloadRecording();
        });
        
        this.decodeTonesBtn.addEventListener('click', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('decode_tones_click');
            }
            this.decodeTones();
        });
        
        // Metrics dashboard events
        const refreshMetricsBtn = document.getElementById('refreshMetrics');
        const exportMetricsBtn = document.getElementById('exportMetrics');
        const resetMetricsBtn = document.getElementById('resetMetrics');
        
        if (refreshMetricsBtn) {
            refreshMetricsBtn.addEventListener('click', () => {
                this.updateMetricsDisplay();
                this.updateKPIValidation();
                this.addLogEntry('Metrics refreshed', 'info');
            });
        }
        
        if (exportMetricsBtn) {
            exportMetricsBtn.addEventListener('click', () => {
                this.exportMetricsData();
            });
        }
        
        if (resetMetricsBtn) {
            resetMetricsBtn.addEventListener('click', () => {
                if (window.metricsCollector) {
                    window.metricsCollector.reset();
                    this.updateMetricsDisplay();
                    this.updateKPIValidation();
                    this.addLogEntry('Metrics session reset', 'info');
                }
            });
        }
        
        // Auto-validate ENS on input
        this.ensAddressInput.addEventListener('input', () => {
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('ens_input_change');
            }
            this.validateENS();
        });
    }

    exportMetricsData() {
        if (!window.metricsCollector) return;
        
        const metricsData = window.metricsCollector.exportMetrics();
        const dataStr = JSON.stringify(metricsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ens-voicemail-metrics-${Date.now()}.json`;
        link.click();
        
        this.addLogEntry('Metrics data exported', 'info');
    }

    async validateENS() {
        const address = this.ensAddressInput.value.trim();
        if (!address) {
            this.showStatus('Please enter an ENS address', 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('validate_ens', false);
            }
            return false;
        }
        
        // Basic ENS validation (ends with .eth and has valid characters)
        const ensRegex = /^[a-zA-Z0-9-]+\.eth$/;
        if (!ensRegex.test(address)) {
            this.showStatus('Invalid ENS address format. Must end with .eth and contain only letters, numbers, and hyphens.', 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('validate_ens', false);
            }
            return false;
        }
        
        this.showStatus('Loading ENS resolver...', 'info');
        
        try {
            await this.loadEthers();
        } catch (e) {
            this.showStatus('❌ Could not load ENS resolver library (ethers.js). Please check your internet connection.', 'error');
            this.addLogEntry(`Ethers.js loading failed: ${e.message}`, 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('validate_ens', false);
                window.metricsCollector.recordErrorRecovery(false);
            }
            return false;
        }
        
        try {
            this.showStatus('Resolving ENS address...', 'info');
            
            // Use Alchemy with API key from environment variables
            const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo';
            const provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`);
            const resolvedAddress = await provider.resolveName(address);
            
            if (resolvedAddress) {
                this.showStatus(`✅ ENS resolved: ${resolvedAddress}`, 'success');
                this.displayAddress.textContent = `${address} → ${resolvedAddress}`;
                this.resolvedAddress = resolvedAddress;
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordENSResolution(true);
                    window.metricsCollector.recordUserInteraction('validate_ens', true);
                }
                
                return true;
            } else {
                this.showStatus('❌ ENS address not found or not registered', 'error');
                this.displayAddress.textContent = '-';
                this.resolvedAddress = null;
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordENSResolution(false);
                    window.metricsCollector.recordUserInteraction('validate_ens', false);
                }
                
                return false;
            }
        } catch (error) {
            console.error('ENS resolution error:', error);
            this.showStatus('❌ Error resolving ENS address. Please check your connection.', 'error');
            this.displayAddress.textContent = '-';
            this.resolvedAddress = null;
            
            if (window.metricsCollector) {
                window.metricsCollector.recordENSResolution(false);
                window.metricsCollector.recordUserInteraction('validate_ens', false);
                window.metricsCollector.recordErrorRecovery(false);
            }
            
            return false;
        }
    }

    showStatus(message, type) {
        this.ensStatus.textContent = message;
        this.ensStatus.className = `status ${type}`;
        this.addLogEntry(message, type);
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
                this.showStatus('Recording complete. Ready to generate tones.', 'success');
            };
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            this.recordingIndicator.classList.remove('hidden');
            this.startRecordingTimer();
            this.showStatus('Recording started...', 'info');
        } catch (error) {
            this.showStatus('❌ Error accessing microphone. Please ensure you have granted microphone permissions.', 'error');
            this.addLogEntry(error.message, 'error');
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
            this.showStatus('Recording stopped.', 'info');
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
            try {
                const audioUrl = URL.createObjectURL(this.audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                this.showStatus('Playing your recording...', 'info');
            } catch (error) {
                this.showStatus('❌ Error playing recording.', 'error');
                this.addLogEntry(error.message, 'error');
            }
        } else {
            this.showStatus('No recording available to play.', 'error');
        }
    }

    generateTones() {
        if (!this.resolvedAddress) {
            this.showStatus('Please validate an ENS address first', 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones', false);
            }
            return;
        }
        
        // Record the user interaction at the start
        if (window.metricsCollector) {
            window.metricsCollector.recordUserInteraction('generate_tones_click');
        }
        
        try {
            console.log('🔧 Starting tone generation for:', this.resolvedAddress);
            
            // Use cache if available
            let tones = this.toneCache.get(this.resolvedAddress);
            if (!tones) {
                console.log('🔧 Generating new tones (not in cache)');
                tones = this.encodeENSToTones(this.resolvedAddress);
                // Maintain cache size
                if (this.toneCache.size >= this.maxCacheSize) {
                    this.toneCache.delete(this.toneCache.keys().next().value);
                }
                this.toneCache.set(this.resolvedAddress, tones);
            } else {
                console.log('🔧 Using cached tones');
            }
            
            const totalDuration = tones.reduce((sum, tone) => sum + tone.duration, 0);
            this.toneDuration.textContent = `${totalDuration.toFixed(1)}s`;
            this.totalLength.textContent = `${totalDuration.toFixed(1)}s`;
            this.playWithTonesBtn.disabled = false;
            this.downloadRecordingBtn.disabled = false;
            this.encodedTones = tones;
            this.showStatus('DTMF tones generated. Ready to play or download.', 'success');
            
            console.log('🔧 Drawing waveform...');
            this.drawToneWaveform(tones);
            
            console.log('🔧 Playing tones...');
            this.playTonesOnly(tones);
            
            // Measure DTMF accuracy against expected sequence
            const generatedSequence = tones.map(t => t.dtmfChar).filter(Boolean).join('');
            const expectedSequence = this.getExpectedDTMFSequence(this.resolvedAddress);
            if (expectedSequence && window.metricsCollector) {
                const accuracy = window.metricsCollector.measureDTMFAccuracy(generatedSequence, expectedSequence);
                this.addLogEntry(`DTMF accuracy: ${accuracy.toFixed(1)}%`, 'info');
            }
            
            // Record successful generation
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones', true);
            }
            
            console.log('🔧 Tone generation completed successfully');
            
        } catch (error) {
            console.error('❌ Error in generateTones:', error);
            this.showStatus('❌ Error generating DTMF tones.', 'error');
            this.addLogEntry(error.message, 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('generate_tones', false);
                window.metricsCollector.recordErrorRecovery(false);
            }
        }
    }

    getExpectedDTMFSequence(address) {
        // Convert address to expected DTMF sequence for accuracy measurement
        try {
            const hexAddress = address.toLowerCase().replace('0x', '');
            let dtmfSequence = this.startMarker;
            
            for (let i = 0; i < hexAddress.length; i++) {
                const char = hexAddress[i];
                const dtmfChar = this.charToDTMF[char];
                if (dtmfChar) {
                    dtmfSequence += dtmfChar;
                }
            }
            
            dtmfSequence += this.stopMarker;
            return dtmfSequence;
        } catch (error) {
            console.error('Error generating expected DTMF sequence:', error);
            return null;
        }
    }

    drawToneWaveform(tones) {
        const canvas = document.getElementById('toneWaveform');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Generate waveform data
        const sampleRate = 6000; // Lower for visualization
        const totalSamples = Math.floor(tones.reduce((sum, t) => sum + t.duration, 0) * sampleRate);
        const waveform = new Float32Array(totalSamples);
        let sampleIdx = 0;
        tones.forEach(tone => {
            const samples = Math.floor(tone.duration * sampleRate);
            if (tone.frequencies) {
                for (let i = 0; i < samples; i++) {
                    const t = i / sampleRate;
                    const s1 = Math.sin(2 * Math.PI * tone.frequencies[0] * t);
                    const s2 = Math.sin(2 * Math.PI * tone.frequencies[1] * t);
                    waveform[sampleIdx++] = (s1 + s2) * 0.5;
                }
            } else {
                for (let i = 0; i < samples; i++) {
                    waveform[sampleIdx++] = 0;
                }
            }
        });
        // Draw waveform
        ctx.strokeStyle = '#00ff99';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const idx = Math.floor(x / canvas.width * waveform.length);
            const y = (1 - waveform[idx]) * 0.5 * canvas.height;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    playTonesOnly(tones) {
        try {
            console.log('🎵 Initializing audio context for playback...');
            this.initializeAudioContext();
            
            if (!this.audioContext) {
                throw new Error('Audio context not available');
            }
            
            console.log('🎵 Starting tone playback...');
            this.playTones(tones);
            this.showStatus('Playing DTMF tones...', 'info');
            
        } catch (error) {
            console.error('❌ Error in playTonesOnly:', error);
            this.showStatus('❌ Error playing tones.', 'error');
            this.addLogEntry(error.message, 'error');
            // Re-throw the error so generateTones can catch it
            throw error;
        }
    }

    encodeENSToTones(address) {
        // Convert address to hex string (remove 0x prefix, lowercase)
        const hexAddress = address.replace(/^0x/, '').toLowerCase();
        
        const tones = [];
        
        // Add start marker
        tones.push({
            frequencies: this.dtmfFrequencies[this.startMarker],
            duration: this.toneDuration,
            character: this.startMarker,
            dtmfChar: this.startMarker
        });
        
        // Add silence after start marker
        tones.push({
            frequencies: null,
            duration: this.silenceDuration,
            character: 'silence',
            dtmfChar: null
        });
        
        // Encode hex characters
        for (let i = 0; i < hexAddress.length; i++) {
            const char = hexAddress[i];
            const dtmfChar = this.charToDTMF[char];
            
            if (dtmfChar && this.dtmfFrequencies[dtmfChar]) {
                tones.push({
                    frequencies: this.dtmfFrequencies[dtmfChar],
                    duration: this.toneDuration,
                    character: char,
                    dtmfChar: dtmfChar
                });
                
                // Add silence between tones (except for last character)
                if (i < hexAddress.length - 1) {
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
        }
        
        // Add silence before stop marker
        tones.push({
            frequencies: null,
            duration: this.silenceDuration,
            character: 'silence',
            dtmfChar: null
        });
        
        // Add stop marker
        tones.push({
            frequencies: this.dtmfFrequencies[this.stopMarker],
            duration: this.toneDuration,
            character: this.stopMarker,
            dtmfChar: this.stopMarker
        });
        
        console.log(`🔧 Generated ${tones.length} audio segments for ${hexAddress.length} hex characters`);
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
            this.showStatus('No recording or tones available.', 'error');
            return;
        }
        try {
            this.initializeAudioContext();
            const audioUrl = URL.createObjectURL(this.audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                this.playTones(this.encodedTones);
                this.showStatus('Playing DTMF tones after your recording...', 'info');
            };
            audio.play();
            this.showStatus('Playing your recording...', 'info');
        } catch (error) {
            this.showStatus('❌ Error playing audio with tones.', 'error');
            this.addLogEntry(error.message, 'error');
        }
    }

    playTones(tones) {
        let currentTime = this.audioContext.currentTime;
        
        // Log summary instead of individual tones
        const toneCount = tones.filter(t => t.frequencies).length;
        const silenceCount = tones.filter(t => !t.frequencies).length;
        console.log(`🎵 Playing ${toneCount} DTMF tones and ${silenceCount} silence segments`);
        
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
                gainNode1.gain.setValueAtTime(0.18, currentTime); // slightly lower for normalization
                gainNode2.gain.setValueAtTime(0.18, currentTime);
                
                // Master gain envelope to avoid clicks
                masterGain.gain.setValueAtTime(0, currentTime);
                masterGain.gain.linearRampToValueAtTime(0.4, currentTime + 0.01);
                masterGain.gain.linearRampToValueAtTime(0.4, currentTime + tone.duration - 0.01);
                masterGain.gain.linearRampToValueAtTime(0, currentTime + tone.duration);
                
                // Start and stop oscillators
                oscillator1.start(currentTime);
                oscillator2.start(currentTime);
                oscillator1.stop(currentTime + tone.duration);
                oscillator2.stop(currentTime + tone.duration);
                
                // Only log first few tones for debugging
                if (index < 3) {
                    console.log(`🎵 Tone ${index + 1}: ${tone.dtmfChar} (${tone.frequencies[0]}Hz + ${tone.frequencies[1]}Hz)`);
                }
            }
            
            currentTime += tone.duration;
        });
        
        console.log(`🎵 DTMF playback completed`);
    }

    async downloadRecording() {
        if (!this.audioBlob || !this.encodedTones) {
            this.showStatus('No recording or tones to download.', 'error');
            return;
        }
        try {
            const combinedAudio = await this.combineAudioWithTones();
            const url = URL.createObjectURL(combinedAudio);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voicemail-${this.ensAddressInput.value.trim()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showStatus('Download started.', 'success');
        } catch (error) {
            this.showStatus('❌ Error creating download.', 'error');
            this.addLogEntry(error.message, 'error');
        }
    }

    async combineAudioWithTones() {
        if (!this.audioBlob || !this.encodedTones) {
            throw new Error('No audio recording or tones available');
        }
        try {
            // Use cache if available
            const cacheKey = this.resolvedAddress;
            if (this.bufferCache.has(cacheKey)) {
                return this.bufferCache.get(cacheKey);
            }
            this.initializeAudioContext();
            const audioContext = this.audioContext;
            
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
            this.bufferCache.set(cacheKey, wavBlob);
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
            this.showStatus('Please select an audio file to decode.', 'error');
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('decode_tones', false);
            }
            return;
        }
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const decodedAddress = this.decodeTonesFromAudio(audioBuffer);
            
            if (decodedAddress) {
                this.decodeResult.textContent = `Decoded ENS Address: ${decodedAddress}`;
                this.showStatus('DTMF tones decoded successfully.', 'success');
                
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
                    
                    this.addLogEntry(`Decoding accuracy: ${accuracy.toFixed(1)}%`, 'info');
                }
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordUserInteraction('decode_tones', true);
                }
            } else {
                this.decodeResult.textContent = 'No valid ENS address found in the audio.';
                this.showStatus('No valid ENS address found in the audio.', 'error');
                
                if (window.metricsCollector) {
                    window.metricsCollector.recordUserInteraction('decode_tones', false);
                    window.metricsCollector.metrics.decodingAccuracy = 0;
                }
            }
        } catch (error) {
            this.showStatus('❌ Error decoding audio file.', 'error');
            this.decodeResult.textContent = 'Error decoding audio file. Please ensure it contains valid ENS tones.';
            this.addLogEntry(error.message, 'error');
            
            if (window.metricsCollector) {
                window.metricsCollector.recordUserInteraction('decode_tones', false);
                window.metricsCollector.recordErrorRecovery(false);
                window.metricsCollector.metrics.decodingAccuracy = 0;
            }
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
            const detectedRow = this.findClosestFrequency(prominent, rowFreqs, tolerance);
            const detectedCol = this.findClosestFrequency(prominent, colFreqs, tolerance);
            // Confidence logging
            if (prominent.length > 0) {
                this.addLogEntry(`FFT window [${i}]: Top freq ${prominent[0].frequency.toFixed(1)}Hz (mag ${prominent[0].magnitude.toFixed(2)})`, 'info');
            }
            if (detectedRow && detectedCol) {
                const dtmfChar = this.frequenciesToDTMF(detectedRow, detectedCol);
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
