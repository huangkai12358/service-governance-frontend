import { describe, expect, it, vi } from 'vitest';
import {
  APP_AUTH_VALUE_RULE_MESSAGE,
  createRequiredAppAuthValueValidator,
  isStrongAppAuthValue,
  validateOptionalAppAuthValue
} from '@/views/app/passwordPolicy';

/**
 * 执行 Element Plus 回调式校验器，并把校验错误转换为测试可断言的消息。
 */
async function runValidator(validator: ReturnType<typeof createRequiredAppAuthValueValidator>, value: unknown) {
  return new Promise<string | undefined>((resolve) => {
    validator({} as never, value, (error?: string | Error) => {
      resolve(typeof error === 'string' ? error : error?.message);
    }, {} as never, {} as never);
  });
}

describe('passwordPolicy', () => {
  it('识别满足长度、大小写英文和数字组合的应用认证值', () => {
    expect(isStrongAppAuthValue('AppCode2026')).toBe(true);
    expect(isStrongAppAuthValue('appcode2026')).toBe(false);
    expect(isStrongAppAuthValue('APPCODE2026')).toBe(false);
    expect(isStrongAppAuthValue('AppCode')).toBe(false);
    expect(isStrongAppAuthValue('App1')).toBe(false);
  });

  it('必填认证值为空时返回业务必填提示', async () => {
    const validator = createRequiredAppAuthValueValidator('请输入主密码');

    await expect(runValidator(validator, '   ')).resolves.toBe('请输入主密码');
  });

  it('必填认证值强度不足时返回统一强度提示', async () => {
    const validator = createRequiredAppAuthValueValidator('请输入主密码');

    await expect(runValidator(validator, 'weak2026')).resolves.toBe(APP_AUTH_VALUE_RULE_MESSAGE);
  });

  it('必填认证值满足规则时允许通过', async () => {
    const validator = createRequiredAppAuthValueValidator('请输入主密码');

    await expect(runValidator(validator, 'AppCode2026')).resolves.toBeUndefined();
  });

  it('可选认证值未填写时允许通过，填写后校验强度', async () => {
    const callback = vi.fn();

    validateOptionalAppAuthValue({} as never, '   ', callback, {} as never, {} as never);
    expect(callback).toHaveBeenCalledWith();

    const weakCallback = vi.fn();
    validateOptionalAppAuthValue({} as never, 'weak2026', weakCallback, {} as never, {} as never);
    expect(weakCallback.mock.calls[0][0]).toEqual(new Error(APP_AUTH_VALUE_RULE_MESSAGE));
  });

  it('可选认证值满足规则时允许通过', () => {
    const callback = vi.fn();

    validateOptionalAppAuthValue({} as never, 'AppCode2026', callback, {} as never, {} as never);

    expect(callback).toHaveBeenCalledWith();
  });
});
