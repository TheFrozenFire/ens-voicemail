/**
 * DTMF Encoder Module
 * Handles encoding ENS addresses to DTMF tones
 */

import { dtmfUtils } from './dtmfUtils.js';

export class DTMFEncoder {
    constructor() {
        this.toneCache = new Map(); // Cache for DTMF tone arrays by ENS address
        this.maxCacheSize = 10; // Maximum number of cached items
    }

    /**
     * Encode ENS address to DTMF tones
     */
    encodeENSToTones(address) {
        console.log('🔧 encodeENSToTones called with address:', address);
        
        // Convert address to hex string (remove 0x prefix, lowercase)
        const hexAddress = address.replace(/^0x/, '').toLowerCase();
        console.log('🔧 Hex address:', hexAddress);
        console.log('🔧 Hex address length:', hexAddress.length);
        
        const tones = [];
        
        // Add start marker
        console.log('🔧 Adding start marker:', dtmfUtils.startMarker);
        console.log('🔧 Start marker frequencies:', dtmfUtils.dtmfFrequencies[dtmfUtils.startMarker]);
        tones.push({
            frequencies: dtmfUtils.dtmfFrequencies[dtmfUtils.startMarker],
            duration: dtmfUtils.toneDuration,
            character: dtmfUtils.startMarker,
            dtmfChar: dtmfUtils.startMarker
        });
        
        // Add silence after start marker
        console.log('🔧 Adding silence after start marker');
        tones.push({
            frequencies: null,
            duration: dtmfUtils.silenceDuration,
            character: 'silence',
            dtmfChar: null
        });
        
        // Encode hex characters
        console.log('🔧 Encoding hex characters...');
        for (let i = 0; i < hexAddress.length; i++) {
            const char = hexAddress[i];
            const dtmfChar = dtmfUtils.charToDTMF[char];
            console.log(`🔧 Character ${i}: '${char}' -> DTMF: '${dtmfChar}'`);
            
            if (dtmfChar && dtmfUtils.dtmfFrequencies[dtmfChar]) {
                console.log(`🔧 Adding tone for '${char}' with frequencies:`, dtmfUtils.dtmfFrequencies[dtmfChar]);
                tones.push({
                    frequencies: dtmfUtils.dtmfFrequencies[dtmfChar],
                    duration: dtmfUtils.toneDuration,
                    character: char,
                    dtmfChar: dtmfChar
                });
                
                // Add silence between tones (except for last character)
                if (i < hexAddress.length - 1) {
                    console.log('🔧 Adding silence between tones');
                    tones.push({
                        frequencies: null,
                        duration: dtmfUtils.silenceDuration,
                        character: 'silence',
                        dtmfChar: null
                    });
                }
            } else {
                console.warn(`⚠️ Unsupported character for DTMF: ${char}`);
                console.warn(`⚠️ Available characters:`, Object.keys(dtmfUtils.charToDTMF));
            }
        }
        
        // Add silence before stop marker
        console.log('🔧 Adding silence before stop marker');
        tones.push({
            frequencies: null,
            duration: dtmfUtils.silenceDuration,
            character: 'silence',
            dtmfChar: null
        });
        
        // Add stop marker
        console.log('🔧 Adding stop marker:', dtmfUtils.stopMarker);
        console.log('🔧 Stop marker frequencies:', dtmfUtils.dtmfFrequencies[dtmfUtils.stopMarker]);
        tones.push({
            frequencies: dtmfUtils.dtmfFrequencies[dtmfUtils.stopMarker],
            duration: dtmfUtils.toneDuration,
            character: dtmfUtils.stopMarker,
            dtmfChar: dtmfUtils.stopMarker
        });
        
        console.log(`🔧 Generated ${tones.length} audio segments for ${hexAddress.length} hex characters`);
        console.log('🔧 Final tones array:', tones);
        return tones;
    }

    /**
     * Generate tones for an ENS address with caching
     */
    generateTones(address) {
        // Use cache if available
        if (this.toneCache.has(address)) {
            console.log('🔧 Using cached tones');
            return this.toneCache.get(address);
        }
        
        console.log('🔧 Generating new tones (not in cache)');
        const tones = this.encodeENSToTones(address);
        
        // Maintain cache size
        if (this.toneCache.size >= this.maxCacheSize) {
            this.toneCache.delete(this.toneCache.keys().next().value);
        }
        this.toneCache.set(address, tones);
        
        return tones;
    }

    /**
     * Clear the tone cache
     */
    clearCache() {
        this.toneCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.toneCache.size,
            maxSize: this.maxCacheSize,
            keys: Array.from(this.toneCache.keys())
        };
    }
}

// Export a singleton instance
export const dtmfEncoder = new DTMFEncoder(); 