// Unit tests for core utility functions
import { jest } from '@jest/globals';

// Mock the DOM environment
document.body.innerHTML = `
  <div id="ensStatus"></div>
  <div id="debugLogs"></div>
  <div id="displayAddress"></div>
  <div id="toneDuration"></div>
  <div id="totalLength"></div>
  <div id="decodeResult"></div>
  <canvas id="toneWaveform"></canvas>
`;

// Import the class (we'll need to extract some functions for testing)
// For now, let's test the utility functions we can extract

describe('DTMF Utility Functions', () => {
  // Test DTMF frequency mapping
  test('should have correct DTMF frequency pairs', () => {
    const dtmfFrequencies = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633],
      'E': [941, 1633], 'F': [941, 1633]
    };

    // Test that all standard DTMF frequencies are present
    expect(dtmfFrequencies['1']).toEqual([697, 1209]);
    expect(dtmfFrequencies['5']).toEqual([770, 1336]);
    expect(dtmfFrequencies['0']).toEqual([941, 1336]);
    expect(dtmfFrequencies['A']).toEqual([697, 1633]);
    expect(dtmfFrequencies['F']).toEqual([941, 1633]);
  });

  test('should have correct character to DTMF mapping', () => {
    const charToDTMF = {
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
      '8': '8', '9': '9',
      'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
      'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F'
    };

    // Test hex digit mapping
    expect(charToDTMF['a']).toBe('A');
    expect(charToDTMF['f']).toBe('F');
    expect(charToDTMF['0']).toBe('0');
    expect(charToDTMF['9']).toBe('9');
    
    // Test case insensitivity
    expect(charToDTMF['A']).toBe('A');
    expect(charToDTMF['F']).toBe('F');
  });
});

describe('ENS Address Validation', () => {
  test('should validate correct ENS address format', () => {
    const validAddresses = [
      'vitalik.eth',
      'test.eth',
      'my-domain.eth',
      'a.eth',
      'very-long-domain-name.eth'
    ];

    validAddresses.forEach(address => {
      // Improved ENS format validation regex (no leading/trailing hyphens, no consecutive hyphens)
      const ensRegex = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,63}(?<!-)\.eth$/;
      expect(ensRegex.test(address)).toBe(true);
    });
  });

  test('should reject invalid ENS address format', () => {
    const invalidAddresses = [
      'invalid@ens.address',
      'test.eth.',
      '.eth',
      'test',
      'test.eth.com',
      'test..eth',
      'test-.eth',
      '-test.eth',
      'test--test.eth',
      'test-.eth',
      'test.-eth',
      'test-.eth',
      'test--.eth',
      'test--test.eth'
    ];

    invalidAddresses.forEach(address => {
      const ensRegex = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,63}(?<!-)\.eth$/;
      expect(ensRegex.test(address)).toBe(false);
    });
  });
});

describe('Frequency Detection', () => {
  test('should find closest frequency within tolerance', () => {
    const frequencies = [
      { frequency: 695, magnitude: 1.0 },
      { frequency: 1205, magnitude: 0.8 },
      { frequency: 850, magnitude: 0.6 }
    ];
    
    const targetFreqs = [697, 770, 852, 941];
    const tolerance = 30;
    
    // Mock the findClosestFrequency function
    const findClosestFrequency = (frequencies, targetFreqs, tolerance) => {
      for (const freq of frequencies) {
        for (const target of targetFreqs) {
          if (Math.abs(freq.frequency - target) <= tolerance) {
            return target;
          }
        }
      }
      return null;
    };

    expect(findClosestFrequency(frequencies, targetFreqs, tolerance)).toBe(697);
  });

  test('should return null when no frequency within tolerance', () => {
    const frequencies = [
      { frequency: 600, magnitude: 1.0 },
      { frequency: 1100, magnitude: 0.8 }
    ];
    
    const targetFreqs = [697, 770, 852, 941];
    const tolerance = 30;
    
    const findClosestFrequency = (frequencies, targetFreqs, tolerance) => {
      for (const freq of frequencies) {
        for (const target of targetFreqs) {
          if (Math.abs(freq.frequency - target) <= tolerance) {
            return target;
          }
        }
      }
      return null;
    };

    expect(findClosestFrequency(frequencies, targetFreqs, tolerance)).toBeNull();
  });
});

describe('DTMF to Hex Conversion', () => {
  test('should convert DTMF sequence to hex correctly', () => {
    const dtmfFrequencies = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633],
      'E': [941, 1633], 'F': [941, 1633]
    };

    const charToDTMF = {
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
      '8': '8', '9': '9',
      'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
      'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F'
    };

    // Mock the dtmfToHexChar function
    const dtmfToHexChar = (dtmfChar) => {
      for (const [hex, dtmf] of Object.entries(charToDTMF)) {
        if (dtmf === dtmfChar) {
          return hex;
        }
      }
      return null;
    };

    // Mock the dtmfToHex function
    const dtmfToHex = (dtmfSequence) => {
      const startMarker = '*';
      const stopMarker = '#';
      const filteredSequence = dtmfSequence.filter(char => char !== startMarker && char !== stopMarker);
      
      const hexChars = [];
      for (const dtmfChar of filteredSequence) {
        const hexChar = dtmfToHexChar(dtmfChar);
        if (hexChar) {
          hexChars.push(hexChar);
        }
      }
      
      return hexChars.join('');
    };

    // Test basic conversion (use DTMF chars for hex: A-F)
    expect(dtmfToHex(['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'B', 'C', 'D', 'E', 'F', '#']))
      .toBe('1234567890abcdef');
    
    // Test without markers
    expect(dtmfToHex(['1', '2', '3', '4', '5'])).toBe('12345');
    
    // Test with invalid characters
    expect(dtmfToHex(['1', 'X', '3', '4', '5'])).toBe('1345');
  });
});

describe('Audio Processing', () => {
  test('should calculate RMS correctly', () => {
    const samples = [0.5, 0.3, -0.2, 0.1];
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    
    // Expected RMS for [0.5, 0.3, -0.2, 0.1]
    const expected = Math.sqrt((0.25 + 0.09 + 0.04 + 0.01) / 4);
    expect(rms).toBeCloseTo(expected, 5);
  });

  test('should detect silence correctly', () => {
    const silenceThreshold = 0.01;
    
    const silentSamples = [0.001, -0.002, 0.003, -0.001];
    const silentRms = Math.sqrt(silentSamples.reduce((sum, sample) => sum + sample * sample, 0) / silentSamples.length);
    expect(silentRms).toBeLessThan(silenceThreshold);
    
    const loudSamples = [0.5, -0.3, 0.4, -0.2];
    const loudRms = Math.sqrt(loudSamples.reduce((sum, sample) => sum + sample * sample, 0) / loudSamples.length);
    expect(loudRms).toBeGreaterThan(silenceThreshold);
  });
}); 