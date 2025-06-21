/**
 * DTMF Utilities Module
 * Contains DTMF constants, character mappings, and helper functions
 */

export class DTMFUtils {
    constructor() {
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
    }

    /**
     * Convert DTMF character to hex character
     */
    dtmfToHexChar(dtmfChar) {
        // Reverse mapping from DTMF to hex
        for (const [hex, dtmf] of Object.entries(this.charToDTMF)) {
            if (dtmf === dtmfChar) {
                return hex;
            }
        }
        return null;
    }

    /**
     * Convert DTMF sequence to hex string
     */
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

    /**
     * Convert frequencies to DTMF character
     */
    frequenciesToDTMF(rowFreq, colFreq) {
        // Reverse lookup from frequencies to DTMF character
        for (const [char, freqs] of Object.entries(this.dtmfFrequencies)) {
            if (freqs[0] === rowFreq && freqs[1] === colFreq) {
                return char;
            }
        }
        return null;
    }

    /**
     * Find closest frequency within tolerance
     */
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

    /**
     * Get expected DTMF sequence for an address
     */
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
}

// Export a singleton instance
export const dtmfUtils = new DTMFUtils(); 