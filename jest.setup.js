// BigInt serileştirme desteği
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// Jest ortamını yapılandır
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