import type {
  ActivityRecord,
  ApiGroupItem,
  ApiItem,
  AppGroupAuthorization,
  AppGroupItem,
  AppItem,
  AuthConfigLogItem,
  RemoteCallLogItem,
  SingleAppAuthorization,
  SmartDocImportLogItem,
  VersionDetail,
  VersionHistoryItem
} from '@/types/business';

export const apps: AppItem[] = [
  { id: 'app-1', app_code: 'order-service', app_name: '订单中心', app_description: '负责订单创建、查询和关闭等流程', current_version: 'v2.3.0', create_time: '2026-03-01 09:00:00', update_time: '2026-04-21 17:20:00', is_deleted: 0 },
  { id: 'app-2', app_code: 'user-service', app_name: '用户中心', app_description: '提供会员资料、会员等级和实名能力', current_version: 'v1.4.1', create_time: '2026-03-02 09:00:00', update_time: '2026-04-20 16:00:00', is_deleted: 0 },
  { id: 'app-3', app_code: 'pay-gateway', app_name: '支付网关', app_description: '提供支付预校验、支付提交、退款能力', current_version: 'v3.0.1', create_time: '2026-03-03 09:00:00', update_time: '2026-04-22 10:10:00', is_deleted: 0 },
  { id: 'app-4', app_code: 'stock-service', app_name: '库存服务', app_description: '提供库存校验、预占和释放接口', current_version: 'v1.8.2', create_time: '2026-03-05 09:00:00', update_time: '2026-04-19 14:40:00', is_deleted: 0 },
  { id: 'app-5', app_code: 'marketing-service', app_name: '营销平台', app_description: '提供优惠券校验和活动资格能力', current_version: 'v2.0.0', create_time: '2026-03-07 09:00:00', update_time: '2026-04-18 11:30:00', is_deleted: 0 },
  { id: 'app-6', app_code: 'risk-engine', app_name: '风控引擎', app_description: '提供黑名单校验和风险决策能力', current_version: 'v4.1.0', create_time: '2026-03-10 09:00:00', update_time: '2026-04-21 09:50:00', is_deleted: 0 }
];

export const apis: ApiItem[] = [
  { id: 'api-01', app_code: 'order-service', app_name: '订单中心', api_name: '创建订单', api_path: '/api/order/create', api_method: 'POST', api_version_id: 'v2.3.0', api_description: '提交订单主流程接口', api_group_ids: ['agp-01'], api_group_names: ['订单流程组'], create_time: '2026-03-10 10:00:00', update_time: '2026-04-20 10:32:00', is_deleted: 0 },
  { id: 'api-02', app_code: 'order-service', app_name: '订单中心', api_name: '查询订单详情', api_path: '/api/order/detail', api_method: 'GET', api_version_id: 'v2.3.0', api_description: '按订单号查询订单详情', api_group_ids: ['agp-01'], api_group_names: ['订单流程组'], create_time: '2026-03-10 10:10:00', update_time: '2026-04-20 10:50:00', is_deleted: 0 },
  { id: 'api-03', app_code: 'order-service', app_name: '订单中心', api_name: '关闭超时订单', api_path: '/api/order/close-timeout', api_method: 'POST', api_version_id: 'v2.2.4', api_description: '批量关闭超时未支付订单', api_group_ids: ['agp-01'], api_group_names: ['订单流程组'], create_time: '2026-03-11 10:10:00', update_time: '2026-04-18 10:50:00', is_deleted: 0 },
  { id: 'api-04', app_code: 'user-service', app_name: '用户中心', api_name: '查询用户画像', api_path: '/api/user/profile', api_method: 'GET', api_version_id: 'v1.4.1', api_description: '拉取用户画像标签信息', api_group_ids: ['agp-02'], api_group_names: ['会员能力组'], create_time: '2026-03-10 11:00:00', update_time: '2026-04-20 08:15:00', is_deleted: 0 },
  { id: 'api-05', app_code: 'user-service', app_name: '用户中心', api_name: '查询会员等级', api_path: '/api/member/level', api_method: 'GET', api_version_id: 'v1.1.0', api_description: '查询会员等级和权益', api_group_ids: ['agp-02'], api_group_names: ['会员能力组'], create_time: '2026-03-10 11:10:00', update_time: '2026-04-17 16:10:00', is_deleted: 0 },
  { id: 'api-06', app_code: 'user-service', app_name: '用户中心', api_name: '同步实名信息', api_path: '/api/user/identity/sync', api_method: 'PUT', api_version_id: 'v1.0.0', api_description: '同步实名认证状态', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 11:20:00', update_time: '2026-04-01 13:10:00', is_deleted: 0 },
  { id: 'api-07', app_code: 'pay-gateway', app_name: '支付网关', api_name: '支付预校验', api_path: '/api/pay/pre-check', api_method: 'POST', api_version_id: 'v3.0.1', api_description: '校验支付单状态、限额和风控策略', api_group_ids: ['agp-03'], api_group_names: ['支付鉴权组'], create_time: '2026-03-12 09:30:00', update_time: '2026-04-22 08:00:00', is_deleted: 0 },
  { id: 'api-08', app_code: 'pay-gateway', app_name: '支付网关', api_name: '提交支付', api_path: '/api/pay/submit', api_method: 'POST', api_version_id: 'v3.0.1', api_description: '发起支付扣款流程', api_group_ids: ['agp-03'], api_group_names: ['支付鉴权组'], create_time: '2026-03-12 09:40:00', update_time: '2026-04-20 22:00:00', is_deleted: 0 },
  { id: 'api-09', app_code: 'pay-gateway', app_name: '支付网关', api_name: '发起退款申请', api_path: '/api/pay/refund', api_method: 'POST', api_version_id: 'v3.0.1', api_description: '提交退款申请并更新退款状态机', api_group_ids: ['agp-03'], api_group_names: ['支付鉴权组'], create_time: '2026-03-12 09:50:00', update_time: '2026-04-20 20:12:00', is_deleted: 0 },
  { id: 'api-10', app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询支付流水', api_path: '/api/pay/record', api_method: 'GET', api_version_id: 'v3.0.0', api_description: '根据支付单号查询支付流水', api_group_ids: [], api_group_names: [], create_time: '2026-03-12 10:00:00', update_time: '2026-04-17 12:00:00', is_deleted: 0 },
  { id: 'api-11', app_code: 'stock-service', app_name: '库存服务', api_name: '库存校验', api_path: '/api/stock/check', api_method: 'POST', api_version_id: 'v1.8.0', api_description: '校验 SKU 可售库存', api_group_ids: ['agp-04'], api_group_names: ['库存控制组'], create_time: '2026-03-13 09:00:00', update_time: '2026-04-20 18:00:00', is_deleted: 0 },
  { id: 'api-12', app_code: 'stock-service', app_name: '库存服务', api_name: '库存预占', api_path: '/api/stock/reserve', api_method: 'POST', api_version_id: 'v1.8.2', api_description: '下单时锁定库存', api_group_ids: ['agp-04'], api_group_names: ['库存控制组'], create_time: '2026-03-13 09:10:00', update_time: '2026-04-21 07:55:00', is_deleted: 0 },
  { id: 'api-13', app_code: 'stock-service', app_name: '库存服务', api_name: '库存释放', api_path: '/api/stock/release', api_method: 'POST', api_version_id: 'v1.8.2', api_description: '取消订单时释放库存', api_group_ids: ['agp-04'], api_group_names: ['库存控制组'], create_time: '2026-03-13 09:20:00', update_time: '2026-04-18 09:20:00', is_deleted: 0 },
  { id: 'api-14', app_code: 'marketing-service', app_name: '营销平台', api_name: '校验优惠券', api_path: '/api/coupon/validate', api_method: 'POST', api_version_id: 'v2.0.0', api_description: '校验优惠券可用性', api_group_ids: ['agp-05'], api_group_names: ['营销能力组'], create_time: '2026-03-14 10:00:00', update_time: '2026-04-18 10:20:00', is_deleted: 0 },
  { id: 'api-15', app_code: 'marketing-service', app_name: '营销平台', api_name: '查询活动资格', api_path: '/api/activity/eligibility', api_method: 'POST', api_version_id: 'v1.2.1', api_description: '查询用户活动参与资格', api_group_ids: ['agp-05'], api_group_names: ['营销能力组'], create_time: '2026-03-14 10:10:00', update_time: '2026-04-20 12:00:00', is_deleted: 0 },
  { id: 'api-16', app_code: 'marketing-service', app_name: '营销平台', api_name: '创建营销活动', api_path: '/api/activity/create', api_method: 'POST', api_version_id: 'v1.0.3', api_description: '后台创建活动模板', api_group_ids: ['agp-05'], api_group_names: ['营销能力组'], create_time: '2026-03-14 10:20:00', update_time: '2026-04-12 08:11:00', is_deleted: 0 },
  { id: 'api-17', app_code: 'risk-engine', app_name: '风控引擎', api_name: '风险决策评估', api_path: '/api/risk/evaluate', api_method: 'POST', api_version_id: 'v4.0.0', api_description: '对请求进行风险评估', api_group_ids: ['agp-06'], api_group_names: ['风控能力组'], create_time: '2026-03-15 09:00:00', update_time: '2026-04-21 07:30:00', is_deleted: 0 },
  { id: 'api-18', app_code: 'risk-engine', app_name: '风控引擎', api_name: '黑名单校验', api_path: '/api/risk/blacklist/check', api_method: 'POST', api_version_id: 'v4.1.0', api_description: '校验请求主体是否命中黑名单', api_group_ids: ['agp-06'], api_group_names: ['风控能力组'], create_time: '2026-03-15 09:10:00', update_time: '2026-04-20 09:00:00', is_deleted: 0 },
  { id: 'api-19', app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询退款明细', api_path: '/api/pay/refund/detail', api_method: 'GET', api_version_id: 'v3.0.2', api_description: '根据退款单号查询退款明细', api_group_ids: ['agp-03'], api_group_names: ['支付鉴权组'], create_time: '2026-04-21 09:00:00', update_time: '2026-04-22 08:20:00', is_deleted: 0 },
  { id: 'api-20', app_code: 'pay-gateway', app_name: '支付网关', api_name: '幂等校验', api_path: '/api/pay/idempotent/check', api_method: 'POST', api_version_id: 'v3.0.2', api_description: '支付提交前执行幂等校验', api_group_ids: ['agp-03'], api_group_names: ['支付鉴权组'], create_time: '2026-04-21 09:10:00', update_time: '2026-04-22 08:30:00', is_deleted: 0 }
];

export const apiGroups: ApiGroupItem[] = [
  { id: 'agp-01', api_group_name: '订单流程组', api_group_description: '订单创建、查询和关闭相关接口', app_code: 'order-service', app_name: '订单中心', api_ids: ['api-01', 'api-02', 'api-03'], api_paths: ['/api/order/create', '/api/order/detail', '/api/order/close-timeout'], create_time: '2026-03-16 10:00:00', update_time: '2026-04-20 10:00:00', is_deleted: 0 },
  { id: 'agp-02', api_group_name: '会员能力组', api_group_description: '会员和画像相关接口', app_code: 'user-service', app_name: '用户中心', api_ids: ['api-04', 'api-05'], api_paths: ['/api/user/profile', '/api/member/level'], create_time: '2026-03-16 10:10:00', update_time: '2026-04-20 10:20:00', is_deleted: 0 },
  { id: 'agp-03', api_group_name: '支付鉴权组', api_group_description: '支付预校验、支付和退款相关接口', app_code: 'pay-gateway', app_name: '支付网关', api_ids: ['api-07', 'api-08', 'api-09', 'api-19', 'api-20'], api_paths: ['/api/pay/pre-check', '/api/pay/submit', '/api/pay/refund', '/api/pay/refund/detail', '/api/pay/idempotent/check'], create_time: '2026-03-16 10:20:00', update_time: '2026-04-22 09:30:00', is_deleted: 0 },
  { id: 'agp-04', api_group_name: '库存控制组', api_group_description: '库存校验、预占和释放接口', app_code: 'stock-service', app_name: '库存服务', api_ids: ['api-11', 'api-12', 'api-13'], api_paths: ['/api/stock/check', '/api/stock/reserve', '/api/stock/release'], create_time: '2026-03-16 10:30:00', update_time: '2026-04-19 09:30:00', is_deleted: 0 },
  { id: 'agp-05', api_group_name: '营销能力组', api_group_description: '优惠券和活动资格相关接口', app_code: 'marketing-service', app_name: '营销平台', api_ids: ['api-14', 'api-15', 'api-16'], api_paths: ['/api/coupon/validate', '/api/activity/eligibility', '/api/activity/create'], create_time: '2026-03-16 10:40:00', update_time: '2026-04-18 09:30:00', is_deleted: 0 },
  { id: 'agp-06', api_group_name: '风控能力组', api_group_description: '黑名单和决策相关接口', app_code: 'risk-engine', app_name: '风控引擎', api_ids: ['api-17', 'api-18'], api_paths: ['/api/risk/evaluate', '/api/risk/blacklist/check'], create_time: '2026-03-16 10:50:00', update_time: '2026-04-21 09:30:00', is_deleted: 0 }
];

export const appGroups: AppGroupItem[] = [
  { id: 'grp-01', app_group_name: '交易核心应用组', app_group_description: '订单、支付、库存核心链路应用', app_codes: ['order-service', 'pay-gateway', 'stock-service'], app_names: ['订单中心', '支付网关', '库存服务'], create_time: '2026-03-20 10:00:00', update_time: '2026-04-21 09:00:00', is_deleted: 0 },
  { id: 'grp-02', app_group_name: '用户运营应用组', app_group_description: '用户和营销相关应用', app_codes: ['user-service', 'marketing-service'], app_names: ['用户中心', '营销平台'], create_time: '2026-03-20 10:20:00', update_time: '2026-04-18 09:00:00', is_deleted: 0 },
  { id: 'grp-03', app_group_name: '风控联动应用组', app_group_description: '支付与风控联动应用', app_codes: ['pay-gateway', 'risk-engine'], app_names: ['支付网关', '风控引擎'], create_time: '2026-03-20 10:40:00', update_time: '2026-04-20 11:00:00', is_deleted: 0 }
];

export const versionHistories: VersionHistoryItem[] = [
  { id: 'ver-01', api_version_id: 20260422090001n, app_code: 'pay-gateway', app_name: '支付网关', version: 'v3.0.2', file_name: 'pay-gateway-smartdoc-20260422.json', file_path: '/data/smartdoc/pay-gateway/pay-gateway-smartdoc-20260422.json', remark: '新增退款明细与幂等校验接口', create_time: '2026-04-22 09:10:00' },
  { id: 'ver-02', api_version_id: 20260418151201n, app_code: 'order-service', app_name: '订单中心', version: 'v2.3.0', file_name: 'order-smartdoc-20260418.json', file_path: '/data/smartdoc/order/order-smartdoc-20260418.json', remark: '订单流程文档同步', create_time: '2026-04-18 15:12:00' },
  { id: 'ver-03', api_version_id: 20260412103001n, app_code: 'marketing-service', app_name: '营销平台', version: 'v2.0.0', file_name: 'marketing-smartdoc-20260412.json', file_path: '/data/smartdoc/marketing/marketing-smartdoc-20260412.json', remark: '营销能力文档更新', create_time: '2026-04-12 10:30:00' }
];

export const versionDetails: VersionDetail[] = [
  {
    version: versionHistories[0],
    apis: [
      { id: 'api-07', api_name: '支付预校验', api_path: '/api/pay/pre-check', api_method: 'POST' },
      { id: 'api-08', api_name: '提交支付', api_path: '/api/pay/submit', api_method: 'POST' },
      { id: 'api-09', api_name: '发起退款申请', api_path: '/api/pay/refund', api_method: 'POST' },
      { id: 'api-19', api_name: '查询退款明细', api_path: '/api/pay/refund/detail', api_method: 'GET' },
      { id: 'api-20', api_name: '幂等校验', api_path: '/api/pay/idempotent/check', api_method: 'POST' }
    ],
    rollback_preview: {
      additions: [
        { id: 'api-19', app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询退款明细', api_path: '/api/pay/refund/detail', api_method: 'GET', api_description: '根据退款单号查询退款明细' },
        { id: 'api-20', app_code: 'pay-gateway', app_name: '支付网关', api_name: '幂等校验', api_path: '/api/pay/idempotent/check', api_method: 'POST', api_description: '支付提交前执行幂等校验' }
      ],
      modifications: [
        {
          id: 'mod-01',
          before: { id: 'api-07-old', app_code: 'pay-gateway', app_name: '支付网关', api_name: '支付预校验', api_path: '/api/pay/pre-check', api_method: 'POST', api_description: '校验支付单可执行性' },
          after: { id: 'api-07', app_code: 'pay-gateway', app_name: '支付网关', api_name: '支付预校验', api_path: '/api/pay/pre-check', api_method: 'POST', api_description: '校验支付单状态、限额和风控策略' },
          changed_fields: ['api_description']
        }
      ],
      deletions: [
        { id: 'legacy-01', app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询旧版支付参数', api_path: '/api/pay/legacy/options', api_method: 'GET', api_description: '旧版支付参数查询接口' }
      ]
    }
  },
  {
    version: versionHistories[1],
    apis: [
      { id: 'api-01', api_name: '创建订单', api_path: '/api/order/create', api_method: 'POST' },
      { id: 'api-02', api_name: '查询订单详情', api_path: '/api/order/detail', api_method: 'GET' },
      { id: 'api-03', api_name: '关闭超时订单', api_path: '/api/order/close-timeout', api_method: 'POST' }
    ],
    rollback_preview: { additions: [], modifications: [], deletions: [] }
  },
  {
    version: versionHistories[2],
    apis: [
      { id: 'api-14', api_name: '校验优惠券', api_path: '/api/coupon/validate', api_method: 'POST' },
      { id: 'api-15', api_name: '查询活动资格', api_path: '/api/activity/eligibility', api_method: 'POST' }
    ],
    rollback_preview: { additions: [], modifications: [], deletions: [] }
  }
];

export const singleAppAuthorizations: SingleAppAuthorization[] = [
  { id: 's-auth-01', caller_app_code: 'order-service', caller_app_name: '订单中心', callee_app_code: 'pay-gateway', callee_app_name: '支付网关', api_paths: ['/api/pay/pre-check', '/api/pay/submit', '/api/pay/refund'], api_group_ids: ['agp-03'] },
  { id: 's-auth-02', caller_app_code: 'order-service', caller_app_name: '订单中心', callee_app_code: 'stock-service', callee_app_name: '库存服务', api_paths: ['/api/stock/check', '/api/stock/reserve', '/api/stock/release'], api_group_ids: ['agp-04'] },
  { id: 's-auth-03', caller_app_code: 'marketing-service', caller_app_name: '营销平台', callee_app_code: 'user-service', callee_app_name: '用户中心', api_paths: ['/api/user/profile', '/api/member/level'], api_group_ids: ['agp-02'] },
  { id: 's-auth-04', caller_app_code: 'pay-gateway', caller_app_name: '支付网关', callee_app_code: 'risk-engine', callee_app_name: '风控引擎', api_paths: ['/api/risk/evaluate', '/api/risk/blacklist/check'], api_group_ids: ['agp-06'] }
];

export const appGroupAuthorizations: AppGroupAuthorization[] = [
  { id: 'g-auth-01', app_group_name: '交易核心应用组', app_codes: ['order-service', 'pay-gateway', 'stock-service'], app_names: ['订单中心', '支付网关', '库存服务'] },
  { id: 'g-auth-02', app_group_name: '用户运营应用组', app_codes: ['user-service', 'marketing-service'], app_names: ['用户中心', '营销平台'] },
  { id: 'g-auth-03', app_group_name: '风控联动应用组', app_codes: ['pay-gateway', 'risk-engine'], app_names: ['支付网关', '风控引擎'] }
];

export const authConfigLogs: AuthConfigLogItem[] = Array.from({ length: 24 }).map((_, index) => {
  const api = apis[index % apis.length];
  return {
    auth_log_id: BigInt(`202604230800${String(index + 1).padStart(2, '0')}`),
    caller_app_code: apps[index % apps.length].app_code,
    callee_app_code: api.app_code,
    api_name: api.api_name,
    api_path: api.api_path,
    operation_type: index % 4 === 0 ? '撤销' : '新增',
    log_time: `2026-04-${String((index % 20) + 1).padStart(2, '0')} ${String((index % 10) + 9).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`
  };
});

export const smartDocImportLogs: SmartDocImportLogItem[] = versionHistories.map((item, index) => ({
  api_version_id: item.api_version_id,
  app_code: item.app_code,
  version: item.version,
  file_name: item.file_name,
  file_path: item.file_path,
  remark: item.remark,
  create_time: item.create_time
}));

export const remoteCallLogs: RemoteCallLogItem[] = Array.from({ length: 24 }).map((_, index) => {
  const caller = apps[index % apps.length];
  const callee = apps[(index + 1) % apps.length];
  const result = (['SUCCESS', 'FAIL', 'BYPASS'] as const)[index % 3];
  return {
    call_decision_log_id: BigInt(`202604231000${String(index + 1).padStart(2, '0')}`),
    caller_app_code: caller.app_code,
    callee_app_code: callee.app_code,
    result,
    decision_reason: result === 'SUCCESS' ? '命中授权配置，鉴权通过' : result === 'FAIL' ? '未命中授权配置或鉴权凭证失效' : '白名单应用，绕过鉴权',
    log_time: `2026-04-${String((index % 20) + 1).padStart(2, '0')} ${String((index % 12) + 8).padStart(2, '0')}:${String((index * 5) % 60).padStart(2, '0')}:00`
  };
});

export const dashboardActivities: {
  imports: ActivityRecord[];
  auths: ActivityRecord[];
  calls: ActivityRecord[];
} = {
  imports: [
    { id: 'd-1', title: '支付网关 SmartDoc 导入完成', description: '版本 v3.0.2 已生成，新增 2 个 API，修改 1 个 API', time: '2026-04-22 09:10:00' },
    { id: 'd-2', title: '订单中心文档同步完成', description: '版本 v2.3.0 已归档', time: '2026-04-18 15:12:00' }
  ],
  auths: [
    { id: 'd-3', title: '新增单应用授权', description: 'order-service -> pay-gateway 支付鉴权组', time: '2026-04-22 10:00:00' },
    { id: 'd-4', title: '撤销应用组授权', description: '用户运营应用组撤销部分会员查询权限', time: '2026-04-21 17:20:00' }
  ],
  calls: [
    { id: 'd-5', title: '远程调用判定 SUCCESS', description: 'order-service 调用 pay-gateway 鉴权通过', time: '2026-04-22 10:15:00' },
    { id: 'd-6', title: '远程调用判定 FAIL', description: 'marketing-service 调用 risk-engine 未命中授权', time: '2026-04-22 10:18:00' }
  ]
};
