import type { ActivityRecord, OverviewStats } from '@/types/business';
import { success, wait } from '@/utils/mock';

const stats: OverviewStats = {
  apiCount: 20,
  appCount: 6,
  appGroupCount: 3,
  apiGroupCount: 5,
  grantCount: 22,
  todayCalls: 18243,
  todayAuthFail: 97
};

const imports: ActivityRecord[] = [
  { id: 'd-01', title: '支付网关 SmartDoc 导入完成', description: '生成版本 2026.04.21.01，新增 2 个 API，修改 3 个 API', time: '2026-04-21 09:02:00', type: 'IMPORT' },
  { id: 'd-02', title: '订单中心 API 手工录入', description: '新增接口 保存草稿订单，状态为草稿', time: '2026-04-19 18:24:00', type: 'IMPORT' }
];

const authChanges: ActivityRecord[] = [
  { id: 'a-01', title: '调用授权新增', description: '交易核心组 -> 支付网关 / 支付鉴权组', time: '2026-04-21 10:10:00', type: 'AUTH' },
  { id: 'a-02', title: '调用授权撤销', description: '营销平台 -> 用户中心 / 查询会员等级', time: '2026-04-20 16:00:00', type: 'AUTH' }
];

const recentLogs: ActivityRecord[] = [
  { id: 'l-01', title: '支付预校验调用成功', description: '调用方应用：订单中心，判定结果 SUCCESS', time: '2026-04-21 10:38:00', type: 'LOG' },
  { id: 'l-02', title: '风险决策调用失败', description: '调用方应用：营销平台，判定结果 FAIL', time: '2026-04-21 10:31:00', type: 'LOG' }
];

export async function fetchDashboard() {
  return wait(success({ stats, imports, authChanges, recentLogs }));
}
