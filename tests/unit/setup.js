// Jest setup file for unit tests
import '@testing-library/jest-dom';

// Mock Web Audio API
global.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
  }
  
  createOscillator() {
    return {
      frequency: { value: 0 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
  }
  
  createGain() {
    return {
      gain: { value: 1 },
      connect: jest.fn()
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
  }
  
  createBuffer() {
    return {
      length: 0,
      numberOfChannels: 1,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(0)
    };
  }
  
  resume() {
    return Promise.resolve();
  }
};

global.webkitAudioContext = global.AudioContext;

// Mock MediaRecorder
global.MediaRecorder = class MockMediaRecorder {
  constructor(stream) {
    this.stream = stream;
    this.state = 'inactive';
  }
  
  start() {
    this.state = 'recording';
  }
  
  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }
  
  addEventListener() {}
  removeEventListener() {}
};

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({}))
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 