import type { PageQuery } from '@/types/common';
import { apps } from './base';
import { paginate, success, wait } from '@/utils/mock';
import type { AppEditorPayload, AppPasswordPayload } from '@/types/business';

export interface AppListQuery extends PageQuery {
  app_code?: string;
  app_name?: string;
}

export async function fetchAppList(query: AppListQuery) {
  const list = apps.filter((item) => item.is_deleted === 0).filter((item) => {
    return (!query.app_code || item.app_code.includes(query.app_code)) &&
      (!query.app_name || item.app_name.includes(query.app_name));
  });
  return wait(success(paginate(list, query)));
}

export async function fetchAppDetail(id: number) {
  return wait(success(apps.find((item) => item.id === id) || null));
}

export async function saveApp(payload: AppEditorPayload) {
  if (payload.id) {
    const current = apps.find((item) => item.id === payload.id && item.is_deleted === 0);
    if (!current) {
      return wait(success(false, 'APP 不存在'));
    }

    current.app_name = payload.app_name;
    current.app_description = payload.app_description;
    current.update_time = '2026-04-29 11:30:00';
    return wait(success(true, '保存成功'));
  }

  const existed = apps.find((item) => item.app_code === payload.app_code && item.is_deleted === 0);
  if (existed) {
    return wait(success(false, '应用编码已存在'));
  }

  apps.unshift({
    id: Math.max(0, ...apps.map((item) => item.id)) + 1,
    app_code: payload.app_code,
    app_name: payload.app_name,
    app_description: payload.app_description,
    primary_password: payload.primary_password,
    secondary_password: payload.secondary_password,
    current_version: 'v1.0.0',
    create_time: '2026-04-29 11:30:00',
    update_time: '2026-04-29 11:30:00',
    is_deleted: 0
  });

  return wait(success(true, '保存成功'));
}

export async function addAppPassword(payload: AppPasswordPayload) {
  const current = apps.find((item) => item.id === payload.id && item.is_deleted === 0);
  if (!current) {
    return wait(success(false, 'APP 不存在'));
  }
  if (!payload.password) {
    return wait(success(false, '请输入密码'));
  }
  if (current.primary_password && current.secondary_password) {
    return wait(success(false, '当前已存在两套密码，不能继续添加'));
  }

  // 中文注释：密码只允许新增到空槽位，优先补密码二；如果密码一为空，则先补密码一。
  if (!current.primary_password) {
    current.primary_password = payload.password;
  } else {
    current.secondary_password = payload.password;
  }
  current.update_time = '2026-04-29 11:30:00';
  return wait(success(true, '密码添加成功'));
}

export async function removeAppPassword(payload: AppPasswordPayload) {
  const current = apps.find((item) => item.id === payload.id && item.is_deleted === 0);
  if (!current) {
    return wait(success(false, 'APP 不存在'));
  }
  if (!payload.target) {
    return wait(success(false, '缺少删除目标'));
  }
  if (payload.target === 'primary') {
    if (!current.primary_password) {
      return wait(success(false, '密码一不存在'));
    }
    if (!current.secondary_password) {
      return wait(success(false, '当前仅剩一个密码一，不能删除，否则服务将处于无密码状态'));
    }
    // 中文注释：删除密码一时，密码二自动顶升为密码一，保证服务仍保留当前可用密码。
    current.primary_password = current.secondary_password;
    current.secondary_password = '';
    current.update_time = '2026-04-29 11:30:00';
    return wait(success(true, '密码一已删除，密码二已自动转为密码一'));
  }

  if (!current.secondary_password) {
    return wait(success(false, '密码二不存在'));
  }
  if (!current.primary_password) {
    return wait(success(false, '当前没有密码一，不能删除密码二，否则服务将处于无密码状态'));
  }
  current.secondary_password = '';
  current.update_time = '2026-04-29 11:30:00';
  return wait(success(true, '密码二已删除'));
}

export async function deleteApp() {
  return wait(success(true, '删除成功'));
}
