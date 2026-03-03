export type BackgroundErrorCode =
  | 'API_KEY_NOT_PRESENT'
  | 'ANTHROPIC_AUTH'
  | 'ANTHROPIC_RESPONSE_INVALID'
  | 'GOOGLE_DOC_NOT_FOUND'
  | 'GOOGLE_API_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class BackgroundError extends Error {
  code: BackgroundErrorCode;
  status?: number;
  cause?: unknown;

  constructor(code: BackgroundErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = 'BackgroundError';
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

export function toBackgroundError(error: unknown, defaultCode: BackgroundErrorCode = 'UNKNOWN_ERROR'): BackgroundError {
  if (error instanceof BackgroundError) {
    return error;
  }

  if (error instanceof Error) {
    return new BackgroundError(defaultCode, error.message, { cause: error });
  }

  return new BackgroundError(defaultCode, `${error}`, { cause: error });
}
