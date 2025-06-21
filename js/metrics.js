// metrics.js - KPI and Metrics Collection System
// Implements the measurement infrastructure for ENS Voicemail project

class MetricsCollector {
    constructor() {
        this.metrics = {
            // Performance metrics
            generationTime: [],
            encodingAccuracy: 0,
            decodingAccuracy: 0,
            
            // User experience metrics
            userInteractions: 0,
            errorRate: 0,
            ensResolutionSuccess: 0,
            ensResolutionAttempts: 0,
            
            // Quality metrics
            fixtureTestPasses: 0,
            fixtureTestTotal: 0,
            crossBrowserTests: {
                chrome: false,
                firefox: false,
                webkit: false
            },
            
            // Error tracking
            errors: [],
            errorRecoverySuccess: 0,
            errorRecoveryAttempts: 0
        };
        
        this.startTime = Date.now();
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Performance Measurement
    measureGenerationTime(ensAddress, callback) {
        const start = performance.now();
        return new Promise((resolve) => {
            callback().then((result) => {
                const end = performance.now();
                const time = end - start;
                this.metrics.generationTime.push({
                    time: time,
                    ensAddress: ensAddress,
                    timestamp: Date.now()
                });
                
                // Log if generation time exceeds target
                if (time > 2000) {
                    this.logError('Generation time exceeded 2s target', { time, ensAddress });
                }
                
                resolve(result);
            });
        });
    }

    // DTMF Accuracy Measurement
    measureDTMFAccuracy(generatedSequence, expectedSequence) {
        if (!generatedSequence || !expectedSequence) {
            return 0;
        }

        let correct = 0;
        const minLength = Math.min(generatedSequence.length, expectedSequence.length);
        
        for (let i = 0; i < minLength; i++) {
            if (generatedSequence[i] === expectedSequence[i]) {
                correct++;
            }
        }
        
        const accuracy = (correct / expectedSequence.length) * 100;
        this.metrics.encodingAccuracy = accuracy;
        
        if (accuracy < 95) {
            this.logError('DTMF encoding accuracy below 95% target', { 
                accuracy, 
                generated: generatedSequence, 
                expected: expectedSequence 
            });
        }
        
        return accuracy;
    }

    // ENS Resolution Success Rate
    recordENSResolution(success) {
        this.metrics.ensResolutionAttempts++;
        if (success) {
            this.metrics.ensResolutionSuccess++;
        }
        
        const successRate = (this.metrics.ensResolutionSuccess / this.metrics.ensResolutionAttempts) * 100;
        
        if (successRate < 90 && this.metrics.ensResolutionAttempts > 5) {
            this.logError('ENS resolution success rate below 90% target', { successRate });
        }
        
        return successRate;
    }

    // Error Tracking and Recovery
    logError(message, context = {}) {
        const error = {
            message,
            context,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.metrics.errors.push(error);
        console.error('Metrics Error:', error);
        
        // Calculate error rate
        this.metrics.errorRate = (this.metrics.errors.length / this.metrics.userInteractions) * 100;
    }

    recordErrorRecovery(success) {
        this.metrics.errorRecoveryAttempts++;
        if (success) {
            this.metrics.errorRecoverySuccess++;
        }
        
        const recoveryRate = (this.metrics.errorRecoverySuccess / this.metrics.errorRecoveryAttempts) * 100;
        
        if (recoveryRate < 95 && this.metrics.errorRecoveryAttempts > 3) {
            this.logError('Error recovery rate below 95% target', { recoveryRate });
        }
        
        return recoveryRate;
    }

    // User Interaction Tracking
    recordUserInteraction(action, success = true) {
        this.metrics.userInteractions++;
        
        if (!success) {
            this.logError(`User interaction failed: ${action}`, { action });
        }
    }

    // Fixture Test Results
    recordFixtureTest(success) {
        this.metrics.fixtureTestTotal++;
        if (success) {
            this.metrics.fixtureTestPasses++;
        }
        
        const passRate = (this.metrics.fixtureTestPasses / this.metrics.fixtureTestTotal) * 100;
        
        if (passRate < 100 && this.metrics.fixtureTestTotal > 0) {
            this.logError('Fixture test pass rate below 100% target', { passRate });
        }
        
        return passRate;
    }

    // Cross-browser Compatibility
    recordBrowserTest(browser, success) {
        this.metrics.crossBrowserTests[browser] = success;
        
        const totalBrowsers = Object.keys(this.metrics.crossBrowserTests).length;
        const successfulBrowsers = Object.values(this.metrics.crossBrowserTests).filter(Boolean).length;
        const compatibilityRate = (successfulBrowsers / totalBrowsers) * 100;
        
        if (compatibilityRate < 100) {
            this.logError('Cross-browser compatibility below 100% target', { 
                compatibilityRate, 
                failedBrowsers: Object.keys(this.metrics.crossBrowserTests).filter(b => !this.metrics.crossBrowserTests[b])
            });
        }
        
        return compatibilityRate;
    }

    // Get Current Metrics
    getMetrics() {
        const avgGenerationTime = this.metrics.generationTime.length > 0 
            ? this.metrics.generationTime.reduce((sum, item) => sum + item.time, 0) / this.metrics.generationTime.length 
            : 0;

        const ensResolutionRate = this.metrics.ensResolutionAttempts > 0 
            ? (this.metrics.ensResolutionSuccess / this.metrics.ensResolutionAttempts) * 100 
            : 0;

        const errorRecoveryRate = this.metrics.errorRecoveryAttempts > 0 
            ? (this.metrics.errorRecoverySuccess / this.metrics.errorRecoveryAttempts) * 100 
            : 0;

        const fixturePassRate = this.metrics.fixtureTestTotal > 0 
            ? (this.metrics.fixtureTestPasses / this.metrics.fixtureTestTotal) * 100 
            : 0;

        const crossBrowserRate = Object.values(this.metrics.crossBrowserTests).filter(Boolean).length / 
            Object.keys(this.metrics.crossBrowserTests).length * 100;

        return {
            // Performance KPIs
            avgGenerationTime: avgGenerationTime.toFixed(2) + 'ms',
            encodingAccuracy: this.metrics.encodingAccuracy.toFixed(1) + '%',
            decodingAccuracy: this.metrics.decodingAccuracy.toFixed(1) + '%',
            
            // User Experience KPIs
            userInteractions: this.metrics.userInteractions,
            errorRate: this.metrics.errorRate.toFixed(1) + '%',
            ensResolutionRate: ensResolutionRate.toFixed(1) + '%',
            
            // Quality KPIs
            fixturePassRate: fixturePassRate.toFixed(1) + '%',
            crossBrowserRate: crossBrowserRate.toFixed(1) + '%',
            errorRecoveryRate: errorRecoveryRate.toFixed(1) + '%',
            
            // Session info
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            totalErrors: this.metrics.errors.length
        };
    }

    // Export metrics for external monitoring
    exportMetrics() {
        return {
            metrics: this.getMetrics(),
            rawData: this.metrics,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
    }

    // Reset metrics for new session
    reset() {
        this.metrics = {
            generationTime: [],
            encodingAccuracy: 0,
            decodingAccuracy: 0,
            userInteractions: 0,
            errorRate: 0,
            ensResolutionSuccess: 0,
            ensResolutionAttempts: 0,
            fixtureTestPasses: 0,
            fixtureTestTotal: 0,
            crossBrowserTests: {
                chrome: false,
                firefox: false,
                webkit: false
            },
            errors: [],
            errorRecoverySuccess: 0,
            errorRecoveryAttempts: 0
        };
        this.startTime = Date.now();
        this.sessionId = this.generateSessionId();
    }

    // Validate KPI thresholds
    validateKPIs() {
        const metrics = this.getMetrics();
        const violations = [];

        // Check performance KPIs
        if (parseFloat(metrics.avgGenerationTime) > 2000) {
            violations.push(`Generation time ${metrics.avgGenerationTime} exceeds 2s target`);
        }
        if (parseFloat(metrics.encodingAccuracy) < 95) {
            violations.push(`Encoding accuracy ${metrics.encodingAccuracy} below 95% target`);
        }
        if (parseFloat(metrics.ensResolutionRate) < 90) {
            violations.push(`ENS resolution rate ${metrics.ensResolutionRate} below 90% target`);
        }
        if (parseFloat(metrics.errorRate) > 5) {
            violations.push(`Error rate ${metrics.errorRate} above 5% target`);
        }
        if (parseFloat(metrics.crossBrowserRate) < 100) {
            violations.push(`Cross-browser rate ${metrics.crossBrowserRate} below 100% target`);
        }
        if (parseFloat(metrics.fixturePassRate) < 100) {
            violations.push(`Fixture pass rate ${metrics.fixturePassRate} below 100% target`);
        }

        return {
            valid: violations.length === 0,
            violations: violations
        };
    }
}

// Global metrics instance
window.metricsCollector = new MetricsCollector();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsCollector;
} 