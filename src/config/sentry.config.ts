import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  debug?: boolean;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
}

export function initializeSentry(config: SentryConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    debug: config.debug || false,
    integrations: [new ProfilingIntegration()],
    tracesSampleRate: config.tracesSampleRate || 1.0,
    profilesSampleRate: config.profilesSampleRate || 1.0,
  });
}

export function captureException(error: Error, context?: Record<string, any>): string {
  return Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string {
  return Sentry.captureMessage(message, level);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

export function setUser(user: Sentry.User): void {
  Sentry.setUser(user);
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export function startTransaction(context: Sentry.TransactionContext): Sentry.Transaction {
  return Sentry.startTransaction(context);
}

export function getCurrentHub(): Sentry.Hub {
  return Sentry.getCurrentHub();
}

export function flush(timeout?: number): Promise<boolean> {
  return Sentry.flush(timeout);
}
