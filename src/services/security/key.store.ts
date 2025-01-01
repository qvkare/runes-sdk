import { APIKey } from '../../types/security.types';
import { Logger } from '../../types/logger.types';

export class KeyStore {
  private keys: Map<string, APIKey> = new Map();

  constructor(private readonly logger: Logger) {}

  addKey(key: APIKey): void {
    this.keys.set(key.id, key);
  }

  getKey(id: string): APIKey | undefined {
    return this.keys.get(id);
  }

  removeKey(id: string): void {
    this.keys.delete(id);
  }

  isKeyValid(id: string): boolean {
    const key = this.getKey(id);
    if (!key) {
      return false;
    }

    const now = Date.now();
    const expiresAt =
      typeof key.expiresAt === 'string' ? new Date(key.expiresAt).getTime() : key.expiresAt;

    return expiresAt > now;
  }

  cleanupExpiredKeys(): void {
    const now = Date.now();
    for (const [id, key] of this.keys.entries()) {
      const expiresAt =
        typeof key.expiresAt === 'string' ? new Date(key.expiresAt).getTime() : key.expiresAt;

      if (expiresAt <= now) {
        this.removeKey(id);
        this.logger.debug(`Removed expired key: ${id}`);
      }
    }
  }

  getAllKeys(): APIKey[] {
    return Array.from(this.keys.values());
  }

  getActiveKeys(): APIKey[] {
    const now = Date.now();
    return this.getAllKeys().filter(key => {
      const expiresAt =
        typeof key.expiresAt === 'string' ? new Date(key.expiresAt).getTime() : key.expiresAt;
      return expiresAt > now;
    });
  }
}
