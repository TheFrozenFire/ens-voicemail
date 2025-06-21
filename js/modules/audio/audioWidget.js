/**
 * Audio Widget Module
 * Handles creation and management of HTML5 audio widgets
 */

import { audioContextManager } from './audioContext.js';

export class AudioWidget {
    constructor() {
        this.generatedAudioBuffer = null;
    }

    /**
     * Convert audio buffer to WAV blob
     */
    audioBufferToBlob(buffer) {
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

    /**
     * Create audio buffer from tones
     */
    createAudioBufferFromTones(tones) {
        const audioCtx = audioContextManager.getAudioContext();
        const totalDuration = tones.reduce((sum, t) => sum + t.duration, 0);
        const bufferLength = Math.floor(totalDuration * audioCtx.sampleRate);
        const buffer = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        let currentTime = 0;
        tones.forEach(tone => {
            if (tone.frequencies && tone.frequencies.length === 2) {
                const startSample = Math.floor(currentTime * audioCtx.sampleRate);
                const samples = Math.floor(tone.duration * audioCtx.sampleRate);
                
                for (let i = 0; i < samples; i++) {
                    const t = i / audioCtx.sampleRate;
                    const s1 = Math.sin(2 * Math.PI * tone.frequencies[0] * t);
                    const s2 = Math.sin(2 * Math.PI * tone.frequencies[1] * t);
                    data[startSample + i] = (s1 + s2) * 0.3;
                }
            }
            currentTime += tone.duration;
        });
        
        return buffer;
    }

    /**
     * Create and display audio widget
     * @param {Array} tones - The DTMF tones array
     * @param {HTMLElement} containerElement - The container to append the widget
     * @param {Function} [afterCreateCallback] - Optional callback(audioWidget, containerElement)
     */
    createAudioWidget(tones, containerElement, afterCreateCallback) {
        try {
            console.log('🎵 Creating audio buffer for widget...');
            
            // Create audio buffer from tones
            const buffer = this.createAudioBufferFromTones(tones);
            console.log('🎵 Audio buffer created successfully');
            
            // Store the buffer for later playback
            this.generatedAudioBuffer = buffer;
            
            // Remove any existing audio widgets first
            const existingWidgets = containerElement.querySelectorAll('.dtmf-audio-widget');
            console.log('🎵 Found existing widgets:', existingWidgets.length);
            existingWidgets.forEach(widget => widget.remove());
            
            // Create a proper HTML5 audio widget
            const audioWidget = document.createElement('audio');
            audioWidget.className = 'dtmf-audio-widget';
            audioWidget.controls = true;
            audioWidget.style.width = '100%';
            audioWidget.style.marginTop = '10px';
            
            // Convert audio buffer to blob and create URL
            const blob = this.audioBufferToBlob(buffer);
            const audioUrl = URL.createObjectURL(blob);
            audioWidget.src = audioUrl;
            
            // Clean up blob URL when audio is removed
            audioWidget.addEventListener('loadstart', () => {
                console.log('🎵 Audio widget loaded');
            });
            
            // Add the audio widget to the container
            containerElement.appendChild(audioWidget);
            console.log('🎵 Audio widget added to container');
            
            // Call the callback if provided
            if (typeof afterCreateCallback === 'function') {
                afterCreateCallback(audioWidget, containerElement);
            }
            
            console.log('🎵 Audio widget created successfully');
            return audioWidget;
            
        } catch (err) {
            console.error('❌ Error creating audio widget:', err);
            throw err;
        }
    }

    /**
     * Get the generated audio buffer
     */
    getGeneratedAudioBuffer() {
        return this.generatedAudioBuffer;
    }

    /**
     * Clear the generated audio buffer
     */
    clearGeneratedAudioBuffer() {
        this.generatedAudioBuffer = null;
    }
}

// Export a singleton instance
export const audioWidget = new AudioWidget(); 