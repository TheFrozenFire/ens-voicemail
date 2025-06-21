/**
 * Audio Context Management Module
 * Handles Web Audio API context creation and management
 */

export class AudioContextManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the audio context
     */
    initializeAudioContext() {
        try {
            if (!this.audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.isInitialized = true;
            console.log('Audio context initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }

    /**
     * Get the audio context, initializing if necessary
     */
    getAudioContext() {
        if (!this.isInitialized) {
            this.initializeAudioContext();
        }
        return this.audioContext;
    }

    /**
     * Check if audio context is available
     */
    isAudioContextAvailable() {
        return this.audioContext && this.audioContext.state === 'running';
    }

    /**
     * Resume audio context if suspended
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                return true;
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                return false;
            }
        }
        return true;
    }

    /**
     * Create an audio buffer with specified parameters
     */
    createAudioBuffer(channels, length, sampleRate) {
        const audioCtx = this.getAudioContext();
        if (!audioCtx) {
            throw new Error('Audio context not available');
        }
        return audioCtx.createBuffer(channels, length, sampleRate);
    }

    /**
     * Create a buffer source for playback
     */
    createBufferSource() {
        const audioCtx = this.getAudioContext();
        if (!audioCtx) {
            throw new Error('Audio context not available');
        }
        return audioCtx.createBufferSource();
    }

    /**
     * Get the sample rate of the audio context
     */
    getSampleRate() {
        const audioCtx = this.getAudioContext();
        return audioCtx ? audioCtx.sampleRate : 44100;
    }
}

// Export a singleton instance
export const audioContextManager = new AudioContextManager(); 