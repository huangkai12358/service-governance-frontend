import type { ApiItem, ApiGroupItem, AppGroupItem, AppItem, AuthorizationRecord, RemoteLogItem, RollbackRecord, VersionItem } from '@/types/business';

export const appList: AppItem[] = [
  { id: 'app-01', name: '订单中心', owner: '张磊' },
  { id: 'app-02', name: '用户中心', owner: '王晨' },
  { id: 'app-03', name: '支付网关', owner: '刘洋' },
  { id: 'app-04', name: '库存服务', owner: '赵雪' },
  { id: 'app-05', name: '营销平台', owner: '李桐' },
  { id: 'app-06', name: '风控引擎', owner: '陈涛' }
];

export const appGroups: AppGroupItem[] = [
  { id: 'ag-01', name: '交易核心组', description: '订单、支付、库存核心应用集合', appIds: ['app-01', 'app-03', 'app-04'], appNames: ['订单中心', '支付网关', '库存服务'], updatedAt: '2026-04-20 09:30:00' },
  { id: 'ag-02', name: '用户运营组', description: '用户域与营销域应用集合', appIds: ['app-02', 'app-05'], appNames: ['用户中心', '营销平台'], updatedAt: '2026-04-18 11:10:00' },
  { id: 'ag-03', name: '风控联动组', description: '风控相关调用方集合', appIds: ['app-03', 'app-06'], appNames: ['支付网关', '风控引擎'], updatedAt: '2026-04-16 14:00:00' }
];

export const apiGroups: ApiGroupItem[] = [
  { id: 'pg-01', appId: 'app-01', appName: '订单中心', name: '订单创建组', description: '订单创建与草稿保存接口集合', apiIds: ['api-01', 'api-02', 'api-11'], apiNames: ['创建订单', '查询订单详情', '保存草稿订单'], updatedAt: '2026-04-20 10:00:00' },
  { id: 'pg-02', appId: 'app-03', appName: '支付网关', name: '支付鉴权组', description: '支付预校验和支付确认接口集合', apiIds: ['api-05', 'api-06', 'api-14'], apiNames: ['支付预校验', '提交支付', '发起退款'], updatedAt: '2026-04-20 17:20:00' },
  { id: 'pg-03', appId: 'app-04', appName: '库存服务', name: '库存锁定组', description: '库存校验与锁定释放接口集合', apiIds: ['api-08', 'api-09'], apiNames: ['库存预占', '库存释放'], updatedAt: '2026-04-15 15:40:00' },
  { id: 'pg-04', appId: 'app-02', appName: '用户中心', name: '会员查询组', description: '会员资料与等级查询接口集合', apiIds: ['api-03', 'api-04'], apiNames: ['查询用户画像', '查询会员等级'], updatedAt: '2026-04-14 18:00:00' },
  { id: 'pg-05', appId: 'app-05', appName: '营销平台', name: '优惠能力组', description: '优惠券与活动校验接口集合', apiIds: ['api-10', 'api-12'], apiNames: ['校验优惠券', '查询活动资格'], updatedAt: '2026-04-12 13:10:00' }
];

export const apiList: ApiItem[] = [
  { id: 'api-01', appId: 'app-01', appName: '订单中心', groupIds: ['pg-01'], groupNames: ['订单创建组'], name: '创建订单', description: '提交订单主流程接口', path: '/api/order/create', method: 'POST', version: 'v2.3.0', status: 'ONLINE', createdAt: '2026-03-12 09:00:00', updatedAt: '2026-04-20 10:32:00' },
  { id: 'api-02', appId: 'app-01', appName: '订单中心', groupIds: ['pg-01'], groupNames: ['订单创建组'], name: '查询订单详情', description: '按订单号查询详情', path: '/api/order/detail', method: 'GET', version: 'v2.3.0', status: 'ONLINE', createdAt: '2026-03-12 09:10:00', updatedAt: '2026-04-19 14:20:00' },
  { id: 'api-03', appId: 'app-02', appName: '用户中心', groupIds: ['pg-04'], groupNames: ['会员查询组'], name: '查询用户画像', description: '拉取用户画像标签信息', path: '/api/user/profile', method: 'GET', version: 'v1.4.1', status: 'ONLINE', createdAt: '2026-02-28 11:00:00', updatedAt: '2026-04-20 08:15:00' },
  { id: 'api-04', appId: 'app-02', appName: '用户中心', groupIds: ['pg-04'], groupNames: ['会员查询组'], name: '查询会员等级', description: '读取会员等级和权益', path: '/api/member/level', method: 'GET', version: 'v1.1.0', status: 'ONLINE', createdAt: '2026-03-04 13:15:00', updatedAt: '2026-04-17 16:10:00' },
  { id: 'api-05', appId: 'app-03', appName: '支付网关', groupIds: ['pg-02'], groupNames: ['支付鉴权组'], name: '支付预校验', description: '校验支付单可执行性', path: '/api/pay/pre-check', method: 'POST', version: 'v3.0.0', status: 'ONLINE', createdAt: '2026-03-15 09:30:00', updatedAt: '2026-04-21 08:00:00' },
  { id: 'api-06', appId: 'app-03', appName: '支付网关', groupIds: ['pg-02'], groupNames: ['支付鉴权组'], name: '提交支付', description: '发起支付扣款流程', path: '/api/pay/submit', method: 'POST', version: 'v3.0.1', status: 'ONLINE', createdAt: '2026-03-16 10:45:00', updatedAt: '2026-04-20 22:00:00' },
  { id: 'api-07', appId: 'app-04', appName: '库存服务', groupIds: ['pg-03'], groupNames: ['库存锁定组'], name: '库存校验', description: '校验SKU可售库存', path: '/api/stock/check', method: 'POST', version: 'v1.8.0', status: 'ONLINE', createdAt: '2026-02-10 10:00:00', updatedAt: '2026-04-20 18:00:00' },
  { id: 'api-08', appId: 'app-04', appName: '库存服务', groupIds: ['pg-03'], groupNames: ['库存锁定组'], name: '库存预占', description: '下单时锁定库存', path: '/api/stock/reserve', method: 'POST', version: 'v1.8.2', status: 'ONLINE', createdAt: '2026-02-10 10:30:00', updatedAt: '2026-04-21 07:55:00' },
  { id: 'api-09', appId: 'app-04', appName: '库存服务', groupIds: ['pg-03'], groupNames: ['库存锁定组'], name: '库存释放', description: '超时或取消订单释放库存', path: '/api/stock/release', method: 'POST', version: 'v1.8.2', status: 'ONLINE', createdAt: '2026-02-10 10:50:00', updatedAt: '2026-04-18 09:20:00' },
  { id: 'api-10', appId: 'app-05', appName: '营销平台', groupIds: ['pg-05'], groupNames: ['优惠能力组'], name: '校验优惠券', description: '校验券可用性', path: '/api/coupon/validate', method: 'POST', version: 'v2.0.0', status: 'ONLINE', createdAt: '2026-03-08 12:00:00', updatedAt: '2026-04-18 10:20:00' },
  { id: 'api-11', appId: 'app-01', appName: '订单中心', groupIds: ['pg-01'], groupNames: ['订单创建组'], name: '保存草稿订单', description: '订单草稿保存接口', path: '/api/order/draft/save', method: 'POST', version: 'v2.2.0', status: 'DRAFT', createdAt: '2026-03-22 15:00:00', updatedAt: '2026-04-19 18:20:00' },
  { id: 'api-12', appId: 'app-05', appName: '营销平台', groupIds: ['pg-05'], groupNames: ['优惠能力组'], name: '查询活动资格', description: '校验用户活动参与资格', path: '/api/activity/eligibility', method: 'POST', version: 'v1.2.1', status: 'ONLINE', createdAt: '2026-03-18 16:00:00', updatedAt: '2026-04-20 12:00:00' },
  { id: 'api-13', appId: 'app-06', appName: '风控引擎', groupIds: [], groupNames: [], name: '风险决策评估', description: '对请求进行风险评估', path: '/api/risk/evaluate', method: 'POST', version: 'v4.0.0', status: 'ONLINE', createdAt: '2026-02-01 09:00:00', updatedAt: '2026-04-21 07:30:00' },
  { id: 'api-14', appId: 'app-03', appName: '支付网关', groupIds: ['pg-02'], groupNames: ['支付鉴权组'], name: '发起退款', description: '提交退款单并发起原路退回', path: '/api/pay/refund', method: 'POST', version: 'v3.0.1', status: 'ONLINE', createdAt: '2026-03-28 14:00:00', updatedAt: '2026-04-20 20:12:00' },
  { id: 'api-15', appId: 'app-02', appName: '用户中心', groupIds: [], groupNames: [], name: '同步实名信息', description: '同步实名认证状态', path: '/api/user/identity/sync', method: 'PUT', version: 'v1.0.0', status: 'OFFLINE', createdAt: '2026-01-20 10:12:00', updatedAt: '2026-04-01 13:10:00' },
  { id: 'api-16', appId: 'app-05', appName: '营销平台', groupIds: [], groupNames: [], name: '创建营销活动', description: '后台创建活动模板', path: '/api/activity/create', method: 'POST', version: 'v1.0.3', status: 'DRAFT', createdAt: '2026-03-05 09:18:00', updatedAt: '2026-04-12 08:11:00' },
  { id: 'api-17', appId: 'app-01', appName: '订单中心', groupIds: [], groupNames: [], name: '关闭超时订单', description: '批量关闭超时未支付订单', path: '/api/order/close-timeout', method: 'POST', version: 'v2.2.4', status: 'ONLINE', createdAt: '2026-03-25 20:00:00', updatedAt: '2026-04-20 19:00:00' },
  { id: 'api-18', appId: 'app-03', appName: '支付网关', groupIds: [], groupNames: [], name: '查询支付流水', description: '根据支付单号查询流水', path: '/api/pay/record', method: 'GET', version: 'v3.0.0', status: 'ONLINE', createdAt: '2026-03-18 11:00:00', updatedAt: '2026-04-17 12:00:00' },
  { id: 'api-19', appId: 'app-06', appName: '风控引擎', groupIds: [], groupNames: [], name: '黑名单校验', description: '校验请求主体是否命中黑名单', path: '/api/risk/blacklist/check', method: 'POST', version: 'v4.1.0', status: 'ONLINE', createdAt: '2026-02-18 10:40:00', updatedAt: '2026-04-20 09:00:00' },
  { id: 'api-20', appId: 'app-04', appName: '库存服务', groupIds: [], groupNames: [], name: '查询仓库配额', description: '查询仓库当前配额水位', path: '/api/warehouse/quota', method: 'GET', version: 'v1.5.0', status: 'ONLINE', createdAt: '2026-03-02 17:00:00', updatedAt: '2026-04-14 09:40:00' }
];

export const versions: VersionItem[] = [
  { id: 'ver-01', version: '2026.04.21.01', importedAt: '2026-04-21 09:00:00', summary: '新增退款接口，调整支付预校验描述', changeCount: 6, status: 'CURRENT', scope: '支付网关 / 支付鉴权组' },
  { id: 'ver-02', version: '2026.04.18.02', importedAt: '2026-04-18 15:12:00', summary: '订单中心接口补充草稿能力', changeCount: 4, status: 'ARCHIVED', scope: '订单中心 / 订单创建组' },
  { id: 'ver-03', version: '2026.04.12.01', importedAt: '2026-04-12 10:30:00', summary: '营销活动资格接口重命名', changeCount: 3, status: 'ROLLED_BACK', scope: '营销平台 / 优惠能力组' }
];

export const rollbackRecords: RollbackRecord[] = [
  { id: 'rb-01', version: '2026.04.12.01', operator: '张磊', time: '2026-04-14 09:00:00', reason: '活动资格字段兼容问题，执行回滚' },
  { id: 'rb-02', version: '2026.03.31.03', operator: '陈涛', time: '2026-04-01 13:30:00', reason: '风控评分阈值描述不一致' }
];

export const authorizationRecords: AuthorizationRecord[] = Array.from({ length: 22 }).map((_, index) => ({
  id: `auth-${String(index + 1).padStart(2, '0')}`,
  callerType: index % 3 === 0 ? 'APP_GROUP' : 'APP',
  callerName: index % 3 === 0 ? appGroups[index % appGroups.length].name : appList[index % appList.length].name,
  calleeAppId: appList[(index + 1) % appList.length].id,
  calleeAppName: appList[(index + 1) % appList.length].name,
  resourceType: index % 2 === 0 ? 'API' : 'API_GROUP',
  resourceId: index % 2 === 0 ? apiList[index % apiList.length].id : apiGroups[index % apiGroups.length].id,
  resourceName: index % 2 === 0 ? apiList[index % apiList.length].name : apiGroups[index % apiGroups.length].name,
  path: apiList[index % apiList.length].path,
  version: apiList[index % apiList.length].version,
  operationType: index % 5 === 0 ? 'REVOKE' : 'GRANT',
  operator: ['张磊', '王晨', '刘洋', '赵雪'][index % 4],
  time: `2026-04-${String((index % 20) + 1).padStart(2, '0')} ${String((index % 10) + 9).padStart(2, '0')}:20:00`
}));

export const remoteLogs: RemoteLogItem[] = Array.from({ length: 24 }).map((_, index) => {
  const api = apiList[index % apiList.length];
  const result = (['SUCCESS', 'FAIL', 'BYPASS'] as const)[index % 3];
  return {
    id: `log-${String(index + 1).padStart(3, '0')}`,
    callerApp: appList[(index + 2) % appList.length].name,
    calleeApp: api.appName,
    checkResult: result,
    reason: result === 'SUCCESS' ? '命中授权关系，版本匹配成功' : result === 'FAIL' ? '未配置调用授权或Token无效' : '系统内部白名单调用',
    responseCode: result === 'SUCCESS' ? 200 : result === 'FAIL' ? 403 : 200,
    path: api.path,
    time: `2026-04-${String((index % 21) + 1).padStart(2, '0')} ${String((index % 12) + 8).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`
  };
});
