// Unit tests for metrics collection functionality
import { jest } from '@jest/globals';

// Mock the MetricsCollector class
class MetricsCollector {
  constructor() {
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

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

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
        
        if (time > 2000) {
          this.logError('Generation time exceeded 2s target', { time, ensAddress });
        }
        
        resolve(result);
      });
    });
  }

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

  logError(message, context = {}) {
    const error = {
      message,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.metrics.errors.push(error);
    
    this.metrics.errorRate = (this.metrics.errors.length / this.metrics.userInteractions) * 100;
  }

  recordUserInteraction(action, success = true) {
    this.metrics.userInteractions++;
    
    if (!success) {
      this.logError(`User interaction failed: ${action}`, { action });
    }
  }

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

    return {
      avgGenerationTime: avgGenerationTime.toFixed(1) + 'ms',
      encodingAccuracy: this.metrics.encodingAccuracy.toFixed(1) + '%',
      decodingAccuracy: this.metrics.decodingAccuracy.toFixed(1) + '%',
      userInteractions: this.metrics.userInteractions,
      errorRate: this.metrics.errorRate.toFixed(1) + '%',
      ensResolutionRate: ensResolutionRate.toFixed(1) + '%',
      fixturePassRate: fixturePassRate.toFixed(1) + '%',
      crossBrowserRate: '100.0%', // Mock value
      errorRecoveryRate: errorRecoveryRate.toFixed(1) + '%',
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.startTime,
      totalErrors: this.metrics.errors.length
    };
  }

  validateKPIs() {
    const metrics = this.getMetrics();
    const violations = [];
    
    if (parseFloat(metrics.avgGenerationTime) > 2000) {
      violations.push('Generation time exceeds 2s target');
    }
    
    if (parseFloat(metrics.encodingAccuracy) < 95) {
      violations.push('DTMF encoding accuracy below 95% target');
    }
    
    if (parseFloat(metrics.errorRate) > 5) {
      violations.push('Error rate exceeds 5% target');
    }
    
    if (parseFloat(metrics.ensResolutionRate) < 90) {
      violations.push('ENS resolution rate below 90% target');
    }
    
    return {
      valid: violations.length === 0,
      violations: violations
    };
  }
}

describe('MetricsCollector', () => {
  let metricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
  });

  describe('Initialization', () => {
    test('should initialize with default metrics', () => {
      expect(metricsCollector.metrics.userInteractions).toBe(0);
      expect(metricsCollector.metrics.ensResolutionAttempts).toBe(0);
      expect(metricsCollector.metrics.errors).toEqual([]);
      expect(metricsCollector.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('DTMF Accuracy Measurement', () => {
    test('should calculate 100% accuracy for identical sequences', () => {
      const accuracy = metricsCollector.measureDTMFAccuracy('1234567890abcdef', '1234567890abcdef');
      expect(accuracy).toBe(100);
    });

    test('should calculate partial accuracy for similar sequences', () => {
      const accuracy = metricsCollector.measureDTMFAccuracy('1234567890abcdef', '1234567890abcdee');
      expect(accuracy).toBe(93.75); // 15/16 correct = 93.75%
    });

    test('should return 0 for empty sequences', () => {
      const accuracy = metricsCollector.measureDTMFAccuracy('', '1234567890abcdef');
      expect(accuracy).toBe(0);
    });

    test('should handle null sequences', () => {
      const accuracy = metricsCollector.measureDTMFAccuracy(null, '1234567890abcdef');
      expect(accuracy).toBe(0);
    });
  });

  describe('ENS Resolution Tracking', () => {
    test('should track successful resolutions', () => {
      metricsCollector.recordENSResolution(true);
      metricsCollector.recordENSResolution(true);
      metricsCollector.recordENSResolution(false);
      
      expect(metricsCollector.metrics.ensResolutionAttempts).toBe(3);
      expect(metricsCollector.metrics.ensResolutionSuccess).toBe(2);
    });

    test('should calculate success rate correctly', () => {
      metricsCollector.recordENSResolution(true);
      metricsCollector.recordENSResolution(true);
      metricsCollector.recordENSResolution(false);
      
      const rate = metricsCollector.recordENSResolution(true);
      expect(rate).toBe(75); // 3/4 successful = 75%
    });
  });

  describe('User Interaction Tracking', () => {
    test('should track successful interactions', () => {
      metricsCollector.recordUserInteraction('validate_ens', true);
      metricsCollector.recordUserInteraction('generate_tones', true);
      
      expect(metricsCollector.metrics.userInteractions).toBe(2);
      expect(metricsCollector.metrics.errors).toHaveLength(0);
    });

    test('should log errors for failed interactions', () => {
      metricsCollector.recordUserInteraction('validate_ens', false);
      
      expect(metricsCollector.metrics.userInteractions).toBe(1);
      expect(metricsCollector.metrics.errors).toHaveLength(1);
      expect(metricsCollector.metrics.errors[0].message).toContain('User interaction failed');
    });
  });

  describe('Error Logging', () => {
    test('should log errors with context', () => {
      const context = { test: 'data' };
      metricsCollector.logError('Test error', context);
      
      expect(metricsCollector.metrics.errors).toHaveLength(1);
      expect(metricsCollector.metrics.errors[0].message).toBe('Test error');
      expect(metricsCollector.metrics.errors[0].context).toEqual(context);
      expect(metricsCollector.metrics.errors[0].sessionId).toBe(metricsCollector.sessionId);
    });

    test('should calculate error rate', () => {
      metricsCollector.metrics.userInteractions = 10;
      metricsCollector.logError('Error 1');
      metricsCollector.logError('Error 2');
      
      expect(metricsCollector.metrics.errorRate).toBe(20); // 2 errors / 10 interactions = 20%
    });
  });

  describe('KPI Validation', () => {
    test('should pass validation with good metrics', () => {
      // Set good metrics
      metricsCollector.metrics.generationTime = [{ time: 1000 }];
      metricsCollector.metrics.encodingAccuracy = 98;
      metricsCollector.metrics.errorRate = 2;
      metricsCollector.metrics.ensResolutionSuccess = 9;
      metricsCollector.metrics.ensResolutionAttempts = 10;
      
      const validation = metricsCollector.validateKPIs();
      expect(validation.valid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });

    test('should fail validation with poor metrics', () => {
      // Set poor metrics
      metricsCollector.metrics.generationTime = [{ time: 3000 }];
      metricsCollector.metrics.encodingAccuracy = 90;
      metricsCollector.metrics.errorRate = 10;
      metricsCollector.metrics.ensResolutionSuccess = 5;
      metricsCollector.metrics.ensResolutionAttempts = 10;
      
      const validation = metricsCollector.validateKPIs();
      expect(validation.valid).toBe(false);
      expect(validation.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Retrieval', () => {
    test('should return formatted metrics', () => {
      metricsCollector.metrics.generationTime = [{ time: 1500 }];
      metricsCollector.metrics.encodingAccuracy = 95;
      metricsCollector.metrics.userInteractions = 5;
      
      const metrics = metricsCollector.getMetrics();
      
      expect(metrics.avgGenerationTime).toBe('1500.0ms');
      expect(metrics.encodingAccuracy).toBe('95.0%');
      expect(metrics.userInteractions).toBe(5);
      expect(metrics.sessionId).toBe(metricsCollector.sessionId);
    });

    test('should handle empty generation time array', () => {
      const metrics = metricsCollector.getMetrics();
      expect(metrics.avgGenerationTime).toBe('0.0ms');
    });
  });
}); 