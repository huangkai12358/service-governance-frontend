import { RequestError } from '@/utils/request';

export function shouldUseMockAuthFallback(error: unknown) {
  if (error instanceof RequestError) {
    return false;
  }

  return error instanceof TypeError || error instanceof SyntaxError;
}
