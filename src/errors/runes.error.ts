export class RunesError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'RunesError';
  }
}
