/**
 * Waveform Visualization Module
 * Handles drawing DTMF tone waveforms on canvas
 */

export class WaveformVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize the waveform canvas
     */
    initializeCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Waveform canvas not found:', canvasId);
            return false;
        }
        this.ctx = this.canvas.getContext('2d');
        return true;
    }

    /**
     * Draw waveform from tones
     */
    drawToneWaveform(tones) {
        if (!this.initializeCanvas('toneWaveform')) {
            return;
        }

        const ctx = this.ctx;
        const canvas = this.canvas;
        
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
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        console.log('🔧 Waveform drawn successfully');
    }

    /**
     * Clear the waveform
     */
    clearWaveform() {
        if (!this.ctx || !this.canvas) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Set waveform style
     */
    setWaveformStyle(color = '#00ff99', lineWidth = 2) {
        if (!this.ctx) {
            return;
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
    }

    /**
     * Get canvas dimensions
     */
    getCanvasDimensions() {
        if (!this.canvas) {
            return { width: 0, height: 0 };
        }
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}

// Export a singleton instance
export const waveformVisualizer = new WaveformVisualizer(); 