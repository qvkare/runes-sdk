// BigInt serialization support
if (typeof BigInt !== 'undefined') {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}

// Jest environment configuration
expect.extend({
  toBeBigInt(received) {
    const pass = typeof received === 'bigint';
    if (pass) {
      return {
        message: () => `expected ${received} not to be a BigInt`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a BigInt`,
        pass: false
      };
    }
  }
}); 