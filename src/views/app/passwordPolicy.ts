import type { FormItemRule } from 'element-plus';

export type AppAuthValueValidator = NonNullable<FormItemRule['validator']>;

export const APP_AUTH_VALUE_RULE_MESSAGE = '密码需至少8位，并同时包含大写字母、小写字母和数字';

/**
 * 判断应用认证值是否满足最小长度、大小写英文和数字组合规则。
 */
export function isStrongAppAuthValue(authValue: string) {
  return authValue.length >= 8 && /[A-Z]/.test(authValue) && /[a-z]/.test(authValue) && /\d/.test(authValue);
}

/**
 * 校验可选应用认证值，未输入时允许通过，输入后必须满足强度要求。
 */
export const validateOptionalAppAuthValue: AppAuthValueValidator = (_rule, value, callback) => {
  const authValue = String(value || '').trim();
  if (authValue && !isStrongAppAuthValue(authValue)) {
    callback(new Error(APP_AUTH_VALUE_RULE_MESSAGE));
    return;
  }
  callback();
};

/**
 * 构建必填应用认证值校验器，用于新增 APP 和编辑弹窗里的认证值录入。
 */
export function createRequiredAppAuthValueValidator(requiredMessage: string): AppAuthValueValidator {
  return (_rule, value, callback) => {
    const authValue = String(value || '').trim();
    if (!authValue) {
      callback(new Error(requiredMessage));
      return;
    }
    if (!isStrongAppAuthValue(authValue)) {
      callback(new Error(APP_AUTH_VALUE_RULE_MESSAGE));
      return;
    }
    callback();
  };
}
