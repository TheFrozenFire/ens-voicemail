/**
 * ENS Resolver Module
 * Handles ENS address resolution using ethers.js
 */

export class ENSResolver {
    constructor() {
        this.ethersLoaded = false;
        this.ethersLoadingPromise = null;
        this.apiAvailable = true; // Track if API is available
    }

    /**
     * Load ethers.js library
     */
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
            
            // Try loading from CDN first
            try {
                await tryLoadScript('https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js');
                this.ethersLoaded = true;
                resolve();
            } catch (error) {
                console.warn('Failed to load ethers from CDN, trying local fallback...');
                
                // Fallback to local file
                try {
                    await tryLoadScript('./js/ethers-5.7.2.umd.min.js');
                    this.ethersLoaded = true;
                    resolve();
                } catch (fallbackError) {
                    reject(new Error('Failed to load ethers.js from both CDN and local fallback'));
                }
            }
        });
        
        return this.ethersLoadingPromise;
    }

    /**
     * Validate ENS address format
     */
    validateENSFormat(address) {
        if (!address || !address.trim()) {
            return { valid: false, error: 'Please enter an ENS address' };
        }
        // ENS names must:
        // - be lowercase a-z, 0-9, or hyphens
        // - not start or end with hyphen
        // - not have consecutive hyphens
        // - at least 3 chars before .eth
        // - end with .eth
        const ensRegex = /^(?!-)(?!.*--)[a-z0-9-]{3,}\.eth$/;
        if (!ensRegex.test(address)) {
            return {
                valid: false,
                error: 'Invalid ENS address format. Must be lowercase, at least 3 characters, only a-z, 0-9, hyphens, and end with .eth.'
            };
        }
        if (address.startsWith('-') || address.endsWith('-')) {
            return {
                valid: false,
                error: 'ENS address cannot start or end with a hyphen.'
            };
        }
        if (address.includes('--')) {
            return {
                valid: false,
                error: 'ENS address cannot contain consecutive hyphens.'
            };
        }
        return { valid: true };
    }

    /**
     * Resolve ENS address to Ethereum address
     */
    async resolveENSAddress(address) {
        try {
            await this.loadEthers();
        } catch (e) {
            throw new Error('Could not load ENS resolver library (ethers.js). Please check your internet connection.');
        }
        
        try {
            // Use Alchemy with API key from environment variables
            const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo';
            const provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`);
            
            // Set a timeout for the resolution
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('ENS resolution timeout')), 10000);
            });
            
            const resolutionPromise = provider.resolveName(address);
            const resolvedAddress = await Promise.race([resolutionPromise, timeoutPromise]);
            
            if (resolvedAddress) {
                this.apiAvailable = true; // Reset API availability on success
                return {
                    success: true,
                    address: resolvedAddress,
                    original: address
                };
            } else {
                return {
                    success: false,
                    error: 'ENS address not found or not registered'
                };
            }
        } catch (error) {
            console.error('ENS resolution error:', error);
            
            // Check if it's a rate limit or network error
            if (error.message.includes('429') || error.message.includes('rate limit') || 
                error.message.includes('timeout') || error.message.includes('network')) {
                this.apiAvailable = false;
                throw new Error('ENS resolution service temporarily unavailable. You can still generate DTMF tones for the ENS address.');
            }
            
            throw new Error('Error resolving ENS address. Please check your connection.');
        }
    }

    /**
     * Generate a mock Ethereum address for offline functionality
     * This allows DTMF generation to work even when ENS resolution is unavailable
     */
    generateMockAddress(ensAddress) {
        // Create a deterministic "address" based on the ENS name
        // This is just for demonstration - not a real Ethereum address
        const hash = this.simpleHash(ensAddress);
        return `0x${hash.padEnd(40, '0').substring(0, 40)}`;
    }

    /**
     * Simple hash function for generating mock addresses
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Check if ethers is loaded
     */
    isEthersLoaded() {
        return this.ethersLoaded;
    }

    /**
     * Get loading status
     */
    getLoadingStatus() {
        return {
            loaded: this.ethersLoaded,
            loading: !!this.ethersLoadingPromise,
            apiAvailable: this.apiAvailable
        };
    }
}

// Export a singleton instance
export const ensResolver = new ENSResolver(); 