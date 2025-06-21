/**
 * UI Manager Module
 * Handles DOM element references and UI updates
 */

export class UIManager {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Input elements
        this.elements.ensAddressInput = document.getElementById('ensAddress');
        this.elements.validateENSBtn = document.getElementById('validateENS');
        this.elements.ensStatus = document.getElementById('ensStatus');
        
        // Button elements
        this.elements.generateTonesBtn = document.getElementById('generateTones');
        this.elements.displayAddress = document.getElementById('displayAddress');
        this.elements.toneDurationElement = document.getElementById('toneDuration');
        this.elements.totalLength = document.getElementById('totalLength');
        
        // Decode elements
        this.elements.audioFileInput = document.getElementById('audioFile');
        this.elements.decodeTonesBtn = document.getElementById('decodeTones');
        this.elements.decodeResult = document.getElementById('decodeResult');
        this.elements.audioPlayer = document.getElementById('dtmfAudioPlayer');
    }

    /**
     * Get an element by name
     */
    getElement(name) {
        return this.elements[name];
    }

    /**
     * Update ENS status display
     */
    updateENSStatus(message, type = 'info') {
        const statusElement = this.elements.ensStatus;
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }
    }

    /**
     * Update display address
     */
    updateDisplayAddress(address) {
        if (this.elements.displayAddress) {
            this.elements.displayAddress.textContent = address;
        }
    }

    /**
     * Update tone duration display
     */
    updateToneDuration(duration) {
        if (this.elements.toneDurationElement) {
            this.elements.toneDurationElement.textContent = `${duration.toFixed(1)}s`;
        }
    }

    /**
     * Update total length display
     */
    updateTotalLength(length) {
        if (this.elements.totalLength) {
            this.elements.totalLength.textContent = `${length.toFixed(1)}s`;
        }
    }

    /**
     * Update decode result
     */
    updateDecodeResult(result) {
        if (this.elements.decodeResult) {
            this.elements.decodeResult.textContent = result;
        }
    }

    /**
     * Add log entry to debug logs
     */
    addLogEntry(message, type = 'info') {
        const logsElement = document.getElementById('debugLogs');
        if (!logsElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logsElement.appendChild(logEntry);
        logsElement.scrollTop = logsElement.scrollHeight;
        
        // Keep only last 100 log entries
        while (logsElement.children.length > 100) {
            logsElement.removeChild(logsElement.firstChild);
        }
    }

    /**
     * Clear debug logs
     */
    clearLogs() {
        const logsElement = document.getElementById('debugLogs');
        if (logsElement) {
            logsElement.innerHTML = '';
        }
    }

    /**
     * Copy logs to clipboard
     */
    async copyLogs() {
        const logsElement = document.getElementById('debugLogs');
        if (!logsElement) return;
        
        const logText = Array.from(logsElement.children)
            .map(entry => entry.textContent)
            .join('\n');
        
        try {
            await navigator.clipboard.writeText(logText);
            this.addLogEntry('Logs copied to clipboard', 'success');
        } catch (error) {
            this.addLogEntry('Failed to copy logs: ' + error.message, 'error');
        }
    }
}

// Export a singleton instance
export const uiManager = new UIManager(); 