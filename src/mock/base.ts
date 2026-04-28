import type {
  ActivityRecord,
  ApiGroupItem,
  ApiItem,
  AppGroupItem,
  AppItem,
  AuthConfigLogItem,
  HttpMethod,
  RemoteCallLogItem,
  SingleAppAuthorization,
  SmartDocImportLogItem,
  VersionDetail,
  VersionDiffItem,
  VersionHistoryItem
} from '@/types/business';

const APP_TOTAL = 100;
const API_PER_APP = 100;
const API_GROUP_PER_APP = 5;
const GENERATED_API_ID_BASE = 100000;
const LEGACY_API_ID_BASE = 900000;

const pad = (value: number, length = 2) => String(value).padStart(length, '0');
const dateTime = (day: number, hour: number, minute: number) =>
  `2026-04-${pad(((day - 1) % 23) + 1)} ${pad(hour)}:${pad(minute)}:00`;

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const resources = [
  { code: 'order', name: '订单' },
  { code: 'payment', name: '支付单' },
  { code: 'refund', name: '退款单' },
  { code: 'member', name: '会员' },
  { code: 'profile', name: '用户画像' },
  { code: 'stock', name: '库存' },
  { code: 'coupon', name: '优惠券' },
  { code: 'activity', name: '营销活动' },
  { code: 'risk', name: '风险决策' },
  { code: 'settlement', name: '结算单' },
  { code: 'invoice', name: '发票' },
  { code: 'delivery', name: '履约单' },
  { code: 'contract', name: '合同' },
  { code: 'message', name: '消息通知' },
  { code: 'task', name: '调度任务' },
  { code: 'config', name: '业务配置' },
  { code: 'audit', name: '审计记录' },
  { code: 'report', name: '经营报表' },
  { code: 'rule', name: '规则策略' },
  { code: 'gateway', name: '网关路由' }
];
const actions = [
  { code: 'create', name: '创建' },
  { code: 'detail', name: '查询详情' },
  { code: 'list', name: '分页查询' },
  { code: 'update', name: '更新' },
  { code: 'delete', name: '删除' },
  { code: 'submit', name: '提交' },
  { code: 'cancel', name: '取消' },
  { code: 'sync', name: '同步' },
  { code: 'check', name: '校验' },
  { code: 'batch', name: '批量处理' },
  { code: 'export', name: '导出' },
  { code: 'import', name: '导入' },
  { code: 'preview', name: '预览' },
  { code: 'publish', name: '发布' },
  { code: 'rollback', name: '回滚' },
  { code: 'freeze', name: '冻结' },
  { code: 'release', name: '释放' },
  { code: 'validate', name: '有效性校验' },
  { code: 'evaluate', name: '评估' },
  { code: 'refresh', name: '刷新缓存' }
];
const apiGroupNames = ['查询能力组', '交易写入组', '状态同步组', '批量任务组', '内部治理组'];
const businessDomains = [
  { code: 'trade', name: '交易' },
  { code: 'order', name: '订单' },
  { code: 'customer', name: '客户' },
  { code: 'member', name: '会员' },
  { code: 'payment', name: '支付' },
  { code: 'settlement', name: '结算' },
  { code: 'billing', name: '账务' },
  { code: 'inventory', name: '库存' },
  { code: 'warehouse', name: '仓储' },
  { code: 'delivery', name: '履约' },
  { code: 'coupon', name: '优惠券' },
  { code: 'promotion', name: '促销' },
  { code: 'risk', name: '风控' },
  { code: 'audit', name: '审计' },
  { code: 'message', name: '消息' },
  { code: 'notification', name: '通知' },
  { code: 'report', name: '报表' },
  { code: 'data', name: '数据' },
  { code: 'gateway', name: '网关' },
  { code: 'platform', name: '开放平台' }
];
const serviceCapabilities = [
  { code: 'core', name: '核心', suffix: '中心', desc: '核心业务流程编排与统一入口' },
  { code: 'query', name: '查询', suffix: '服务', desc: '明细查询、分页检索和聚合查询能力' },
  { code: 'sync', name: '同步', suffix: '服务', desc: '跨系统数据同步和状态回传能力' },
  { code: 'rule', name: '规则', suffix: '引擎', desc: '规则配置、策略执行和命中结果输出' },
  { code: 'admin', name: '管理', suffix: '平台', desc: '后台配置、运营管理和治理操作能力' }
];
const appGroupThemes = [
  { name: '交易履约协同组', desc: '覆盖下单、支付、库存和履约核心链路' },
  { name: '会员运营协同组', desc: '覆盖会员资料、权益、营销活动和触达能力' },
  { name: '支付结算协同组', desc: '覆盖支付、退款、结算和账务核对能力' },
  { name: '库存仓储协同组', desc: '覆盖库存校验、仓内作业和履约状态同步' },
  { name: '营销增长协同组', desc: '覆盖优惠券、促销、活动和人群圈选能力' },
  { name: '风控审计协同组', desc: '覆盖风险决策、审计留痕和安全策略能力' },
  { name: '消息通知协同组', desc: '覆盖站内信、短信、邮件和异步通知能力' },
  { name: '数据报表协同组', desc: '覆盖经营报表、指标统计和数据同步能力' },
  { name: '开放网关协同组', desc: '覆盖开放平台、网关路由和外部接入能力' },
  { name: '后台管理协同组', desc: '覆盖配置管理、运营审核和后台治理能力' },
  { name: '订单售后协同组', desc: '覆盖订单查询、退款退货和售后处理能力' },
  { name: '客户服务协同组', desc: '覆盖客户画像、客服工单和服务记录能力' },
  { name: '财务核算协同组', desc: '覆盖账单、发票、资金流水和核算能力' },
  { name: '任务调度协同组', desc: '覆盖批处理任务、调度编排和执行监控能力' },
  { name: '规则策略协同组', desc: '覆盖业务规则、策略灰度和命中分析能力' },
  { name: '主数据协同组', desc: '覆盖基础档案、配置字典和主数据同步能力' },
  { name: '商家运营协同组', desc: '覆盖商家入驻、资质审核和店铺运营能力' },
  { name: '渠道接入协同组', desc: '覆盖渠道订单、渠道库存和渠道对账能力' },
  { name: '供应链协同组', desc: '覆盖采购、供应商、仓配和库存周转能力' },
  { name: '平台治理协同组', desc: '覆盖服务资产、授权关系和调用审计能力' }
];

const seedApps: AppItem[] = [
  { id: 1, app_code: 'order-service', app_name: '订单中心', app_description: '负责订单创建、查询和关闭等流程', current_version: 'v2.3.0', create_time: '2026-03-01 09:00:00', update_time: '2026-04-21 17:20:00', is_deleted: 0 },
  { id: 2, app_code: 'user-service', app_name: '用户中心', app_description: '提供会员资料、会员等级和实名能力', current_version: 'v1.4.1', create_time: '2026-03-02 09:00:00', update_time: '2026-04-20 16:00:00', is_deleted: 0 },
  { id: 3, app_code: 'pay-gateway', app_name: '支付网关', app_description: '提供支付预校验、支付提交、退款能力', current_version: 'v3.0.1', create_time: '2026-03-03 09:00:00', update_time: '2026-04-22 10:10:00', is_deleted: 0 },
  { id: 4, app_code: 'stock-service', app_name: '库存服务', app_description: '提供库存校验、预占和释放接口', current_version: 'v1.8.2', create_time: '2026-03-05 09:00:00', update_time: '2026-04-19 14:40:00', is_deleted: 0 },
  { id: 5, app_code: 'marketing-service', app_name: '营销平台', app_description: '提供优惠券校验和活动资格能力', current_version: 'v2.0.0', create_time: '2026-03-07 09:00:00', update_time: '2026-04-18 11:30:00', is_deleted: 0 },
  { id: 6, app_code: 'risk-engine', app_name: '风控引擎', app_description: '提供黑名单校验和风险决策能力', current_version: 'v4.1.0', create_time: '2026-03-10 09:00:00', update_time: '2026-04-21 09:50:00', is_deleted: 0 }
];

const generatedApps: AppItem[] = Array.from({ length: APP_TOTAL - seedApps.length }, (_, index) => {
  const no = index + seedApps.length + 1;
  const domain = businessDomains[index % businessDomains.length];
  const capability = serviceCapabilities[Math.floor(index / businessDomains.length) % serviceCapabilities.length];
  return {
    id: no,
    app_code: `${domain.code}-${capability.code}-service`,
    app_name: `${domain.name}${capability.name}${capability.suffix}`,
    app_description: `${domain.name}域${capability.desc}，用于服务资产治理、授权配置和调用审计`,
    current_version: `v${(no % 5) + 1}.${no % 10}.${index % 4}`,
    create_time: `2026-03-${pad((index % 25) + 1)} 09:00:00`,
    update_time: dateTime(index + 1, 9 + (index % 9), (index * 7) % 60),
    is_deleted: 0
  };
});

export const apps: AppItem[] = [...seedApps, ...generatedApps];
const appByCode = new Map(apps.map((app) => [app.app_code, app]));

const seedApis: ApiItem[] = [
  { id: 1, app_code: 'order-service', app_name: '订单中心', api_name: '创建订单', api_path: '/api/order/create', api_method: 'POST', api_version_id: 20260422000000n, version: 'v2.3.0', api_description: '提交订单主流程接口', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 10:00:00', update_time: '2026-04-20 10:32:00', is_deleted: 0 },
  { id: 2, app_code: 'order-service', app_name: '订单中心', api_name: '查询订单详情', api_path: '/api/order/detail', api_method: 'GET', api_version_id: 20260422000000n, version: 'v2.3.0', api_description: '按订单号查询订单详情', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 10:10:00', update_time: '2026-04-20 10:50:00', is_deleted: 0 },
  { id: 3, app_code: 'order-service', app_name: '订单中心', api_name: '关闭超时订单', api_path: '/api/order/close-timeout', api_method: 'POST', api_version_id: 20260422000000n, version: 'v2.2.4', api_description: '批量关闭超时未支付订单', api_group_ids: [], api_group_names: [], create_time: '2026-03-11 10:10:00', update_time: '2026-04-18 10:50:00', is_deleted: 0 },
  { id: 4, app_code: 'user-service', app_name: '用户中心', api_name: '查询用户画像', api_path: '/api/user/profile', api_method: 'GET', api_version_id: 20260422000000n, version: 'v1.4.1', api_description: '拉取用户画像标签信息', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 11:00:00', update_time: '2026-04-20 08:15:00', is_deleted: 0 },
  { id: 5, app_code: 'user-service', app_name: '用户中心', api_name: '查询会员等级', api_path: '/api/member/level', api_method: 'GET', api_version_id: 20260422000000n, version: 'v1.1.0', api_description: '查询会员等级和权益', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 11:10:00', update_time: '2026-04-17 16:10:00', is_deleted: 0 },
  { id: 6, app_code: 'user-service', app_name: '用户中心', api_name: '同步实名信息', api_path: '/api/user/identity/sync', api_method: 'PUT', api_version_id: 20260422000000n, version: 'v1.0.0', api_description: '同步实名认证状态', api_group_ids: [], api_group_names: [], create_time: '2026-03-10 11:20:00', update_time: '2026-04-01 13:10:00', is_deleted: 0 },
  { id: 7, app_code: 'pay-gateway', app_name: '支付网关', api_name: '支付预校验', api_path: '/api/pay/pre-check', api_method: 'POST', api_version_id: 20260422000000n, version: 'v3.0.1', api_description: '校验支付单状态、限额和风控策略', api_group_ids: [], api_group_names: [], create_time: '2026-03-12 09:30:00', update_time: '2026-04-22 08:00:00', is_deleted: 0 },
  { id: 8, app_code: 'pay-gateway', app_name: '支付网关', api_name: '提交支付', api_path: '/api/pay/submit', api_method: 'POST', api_version_id: 20260422000000n, version: 'v3.0.1', api_description: '发起支付扣款流程', api_group_ids: [], api_group_names: [], create_time: '2026-03-12 09:40:00', update_time: '2026-04-20 22:00:00', is_deleted: 0 },
  { id: 9, app_code: 'pay-gateway', app_name: '支付网关', api_name: '发起退款申请', api_path: '/api/pay/refund', api_method: 'POST', api_version_id: 20260422000000n, version: 'v3.0.1', api_description: '提交退款申请并更新退款状态机', api_group_ids: [], api_group_names: [], create_time: '2026-03-12 09:50:00', update_time: '2026-04-20 20:12:00', is_deleted: 0 },
  { id: 10, app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询支付流水', api_path: '/api/pay/record', api_method: 'GET', api_version_id: 20260422000000n, version: 'v3.0.0', api_description: '根据支付单号查询支付流水', api_group_ids: [], api_group_names: [], create_time: '2026-03-12 10:00:00', update_time: '2026-04-17 12:00:00', is_deleted: 0 },
  { id: 11, app_code: 'stock-service', app_name: '库存服务', api_name: '库存校验', api_path: '/api/stock/check', api_method: 'POST', api_version_id: 20260422000000n, version: 'v1.8.0', api_description: '校验 SKU 可售库存', api_group_ids: [], api_group_names: [], create_time: '2026-03-13 09:00:00', update_time: '2026-04-20 18:00:00', is_deleted: 0 },
  { id: 12, app_code: 'stock-service', app_name: '库存服务', api_name: '库存预占', api_path: '/api/stock/reserve', api_method: 'POST', api_version_id: 20260422000000n, version: 'v1.8.2', api_description: '下单时锁定库存', api_group_ids: [], api_group_names: [], create_time: '2026-03-13 09:10:00', update_time: '2026-04-21 07:55:00', is_deleted: 0 },
  { id: 13, app_code: 'stock-service', app_name: '库存服务', api_name: '库存释放', api_path: '/api/stock/release', api_method: 'POST', api_version_id: 20260422000000n, version: 'v1.8.2', api_description: '取消订单时释放库存', api_group_ids: [], api_group_names: [], create_time: '2026-03-13 09:20:00', update_time: '2026-04-18 09:20:00', is_deleted: 0 },
  { id: 14, app_code: 'marketing-service', app_name: '营销平台', api_name: '校验优惠券', api_path: '/api/coupon/validate', api_method: 'POST', api_version_id: 20260422000000n, version: 'v2.0.0', api_description: '校验优惠券可用性', api_group_ids: [], api_group_names: [], create_time: '2026-03-14 10:00:00', update_time: '2026-04-18 10:20:00', is_deleted: 0 },
  { id: 15, app_code: 'marketing-service', app_name: '营销平台', api_name: '查询活动资格', api_path: '/api/activity/eligibility', api_method: 'POST', api_version_id: 20260422000000n, version: 'v1.2.1', api_description: '查询用户活动参与资格', api_group_ids: [], api_group_names: [], create_time: '2026-03-14 10:10:00', update_time: '2026-04-20 12:00:00', is_deleted: 0 },
  { id: 16, app_code: 'marketing-service', app_name: '营销平台', api_name: '创建营销活动', api_path: '/api/activity/create', api_method: 'POST', api_version_id: 20260422000000n, version: 'v1.0.3', api_description: '后台创建活动模板', api_group_ids: [], api_group_names: [], create_time: '2026-03-14 10:20:00', update_time: '2026-04-12 08:11:00', is_deleted: 0 },
  { id: 17, app_code: 'risk-engine', app_name: '风控引擎', api_name: '风险决策评估', api_path: '/api/risk/evaluate', api_method: 'POST', api_version_id: 20260422000000n, version: 'v4.0.0', api_description: '对请求进行风险评估', api_group_ids: [], api_group_names: [], create_time: '2026-03-15 09:00:00', update_time: '2026-04-21 07:30:00', is_deleted: 0 },
  { id: 18, app_code: 'risk-engine', app_name: '风控引擎', api_name: '黑名单校验', api_path: '/api/risk/blacklist/check', api_method: 'POST', api_version_id: 20260422000000n, version: 'v4.1.0', api_description: '校验请求主体是否命中黑名单', api_group_ids: [], api_group_names: [], create_time: '2026-03-15 09:10:00', update_time: '2026-04-20 09:00:00', is_deleted: 0 },
  { id: 19, app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询退款明细', api_path: '/api/pay/refund/detail', api_method: 'GET', api_version_id: 20260422000000n, version: 'v3.0.2', api_description: '根据退款单号查询退款明细', api_group_ids: [], api_group_names: [], create_time: '2026-04-21 09:00:00', update_time: '2026-04-22 08:20:00', is_deleted: 0 },
  { id: 20, app_code: 'pay-gateway', app_name: '支付网关', api_name: '幂等校验', api_path: '/api/pay/idempotent/check', api_method: 'POST', api_version_id: 20260422000000n, version: 'v3.0.2', api_description: '支付提交前执行幂等校验', api_group_ids: [], api_group_names: [], create_time: '2026-04-21 09:10:00', update_time: '2026-04-22 08:30:00', is_deleted: 0 }
];

const groupId = (appCode: string, index: number) => (appByCode.get(appCode)?.id || 0) * 10 + index + 1;
const seedApisByApp = seedApis.reduce<Record<string, ApiItem[]>>((record, item) => {
  record[item.app_code] = [...(record[item.app_code] || []), item];
  return record;
}, {});

function withApiGroup(api: ApiItem, order: number): ApiItem {
  const groupIndex = Math.min(Math.floor(order / (API_PER_APP / API_GROUP_PER_APP)), API_GROUP_PER_APP - 1);
  return {
    ...api,
    api_group_ids: [groupId(api.app_code, groupIndex)],
    api_group_names: [apiGroupNames[groupIndex]]
  };
}

function createGeneratedApi(app: AppItem, order: number): ApiItem {
  const resource = resources[order % resources.length];
  const action = actions[Math.floor(order / resources.length) % actions.length];
  const method = methods[(order + app.id) % methods.length];
  const groupIndex = Math.min(Math.floor(order / (API_PER_APP / API_GROUP_PER_APP)), API_GROUP_PER_APP - 1);
  return {
    id: GENERATED_API_ID_BASE + app.id * 1000 + order + 1,
    app_code: app.app_code,
    app_name: app.app_name,
    api_name: `${action.name}${resource.name}`,
    api_path: `/api/${app.app_code}/${resource.code}/${action.code}-${pad(order + 1, 3)}`,
    api_method: method,
    api_version_id: BigInt(`20260422${pad(app.id, 6)}`),
    version: app.current_version,
    api_description: `${app.app_name}提供的${resource.name}${action.name}能力，用于服务间 API 调用治理`,
    api_group_ids: [groupId(app.app_code, groupIndex)],
    api_group_names: [apiGroupNames[groupIndex]],
    create_time: dateTime(order + 1, 8 + (order % 8), (order * 3) % 60),
    update_time: dateTime(order + 8, 10 + (order % 7), (order * 5) % 60),
    is_deleted: 0
  };
}

export const apis: ApiItem[] = apps.flatMap((app) => {
  const normalizedSeedApis = (seedApisByApp[app.app_code] || []).map((api, index) => withApiGroup(api, index));
  const fillApis = Array.from({ length: API_PER_APP - normalizedSeedApis.length }, (_, index) =>
    createGeneratedApi(app, normalizedSeedApis.length + index)
  );
  return [...normalizedSeedApis, ...fillApis];
});

export const apiGroups: ApiGroupItem[] = apps.flatMap((app) =>
  apiGroupNames.map((name, index) => {
    const groupApis = apis.filter((api) => api.app_code === app.app_code && api.api_group_ids.includes(groupId(app.app_code, index)));
    return {
      id: groupId(app.app_code, index),
      api_group_name: name,
      api_group_description: `${app.app_name}${name}，包含 ${groupApis.length} 个 API`,
      app_code: app.app_code,
      app_name: app.app_name,
      api_ids: groupApis.map((api) => api.id),
      api_paths: groupApis.map((api) => api.api_path),
      create_time: dateTime(index + 1, 9, index * 10),
      update_time: dateTime(index + 10, 11, index * 8),
      is_deleted: 0
    };
  })
);

export const appGroups: AppGroupItem[] = Array.from({ length: 20 }, (_, index) => {
  const groupApps = apps.slice(index * 5, index * 5 + 5);
  const theme = appGroupThemes[index];
  return {
    id: index + 1,
    app_group_name: theme.name,
    app_group_description: theme.desc,
    app_codes: groupApps.map((app) => app.app_code),
    app_names: groupApps.map((app) => app.app_name),
    create_time: dateTime(index + 1, 10, index * 2),
    update_time: dateTime(index + 5, 14, index * 3),
    is_deleted: 0
  };
});

const toVersionDiff = (api: ApiItem): VersionDiffItem => ({
  id: api.id,
  app_code: api.app_code,
  app_name: api.app_name,
  api_name: api.api_name,
  api_path: api.api_path,
  api_method: api.api_method,
  api_description: api.api_description
});

export const versionHistories: VersionHistoryItem[] = apps.map((app, index) => ({
  id: index + 1,
  api_version_id: BigInt(`20260422${pad(index + 1, 6)}`),
  app_code: app.app_code,
  app_name: app.app_name,
  version: app.current_version,
  file_name: `${app.app_code}-smartdoc-20260422.json`,
  file_path: `/data/smartdoc/${app.app_code}/${app.app_code}-smartdoc-20260422.json`,
  remark: `${app.app_name} SmartDoc 文档同步，覆盖 ${API_PER_APP} 个 API`,
  create_time: dateTime(index + 1, 9 + (index % 8), (index * 4) % 60)
}));

export const versionDetails: VersionDetail[] = versionHistories.map((version, index) => {
  const appApis = apis.filter((api) => api.app_code === version.app_code);
  return {
    version,
    apis: appApis.map(({ id, api_name, api_path, api_method }) => ({ id, api_name, api_path, api_method }))
  };
});

export const singleAppAuthorizations: SingleAppAuthorization[] = [];
// 构建更具连贯性的复杂拓扑图
// 策略：让前 6 个种子应用（如网关、订单、用户等）成为高密度的中心节点（Hubs）
// 普通应用大部分都与中心节点交互，小部分普通应用之间互相交互
for (let i = 0; i < 400; i++) {
  // 60% 的概率让调用方是核心节点，40% 的概率是普通节点
  const isCoreCaller = (i % 10) < 6;
  const callerIndex = isCoreCaller
    ? (i % 6) // 在 6 个核心应用中轮询
    : 6 + ((i * 13) % (apps.length - 6)); // 在普通应用中分散选择
  const caller = apps[callerIndex];

  // 70% 的概率让被调用方是核心节点
  const isCoreCallee = (i % 10) < 7;
  const calleeIndex = isCoreCallee
    ? ((i * 17) % 6)
    : 6 + ((i * 23) % (apps.length - 6));
  const callee = apps[calleeIndex];

  // 避免自己调用自己
  if (caller.app_code === callee.app_code) continue;

  const calleeApis = apis.filter((api) => api.app_code === callee.app_code).slice(i % 5, (i % 5) + 3);
  if (calleeApis.length === 0) continue;

  singleAppAuthorizations.push({
    id: singleAppAuthorizations.length + 1,
    caller_app_code: caller.app_code,
    caller_app_name: caller.app_name,
    callee_app_code: callee.app_code,
    callee_app_name: callee.app_name,
    api_paths: calleeApis.map((api) => api.api_path),
    api_group_ids: [...new Set(calleeApis.flatMap((api) => api.api_group_ids))]
  });
}

export const authConfigLogs: AuthConfigLogItem[] = Array.from({ length: 500 }, (_, index) => {
  const api = apis[(index * 13) % apis.length];
  const caller = apps[(index * 5) % apps.length];
  return {
    auth_log_id: BigInt(`2026042308${pad(index + 1, 8)}`),
    caller_app_code: caller.app_code,
    callee_app_code: api.app_code,
    api_name: api.api_name,
    api_path: api.api_path,
    operation_type: (index % 4 === 0 ? '撤销' : '新增') as AuthConfigLogItem['operation_type'],
    log_time: dateTime(index + 1, 8 + (index % 12), (index * 7) % 60)
  };
}).sort((a, b) => b.log_time.localeCompare(a.log_time));

export const smartDocImportLogs: SmartDocImportLogItem[] = versionHistories
  .map((item) => ({
    api_version_id: item.api_version_id,
    app_code: item.app_code,
    version: item.version,
    file_name: item.file_name,
    file_path: item.file_path,
    remark: item.remark,
    create_time: item.create_time
  }))
  .sort((a, b) => b.create_time.localeCompare(a.create_time));

export const remoteCallLogs: RemoteCallLogItem[] = Array.from({ length: 800 }, (_, index) => {
  const caller = apps[index % apps.length];
  const callee = apps[(index * 11 + 1) % apps.length];
  const result = (['SUCCESS', 'FAIL', 'BYPASS'] as const)[index % 3];
  return {
    call_decision_log_id: BigInt(`2026042310${pad(index + 1, 8)}`),
    caller_app_code: caller.app_code,
    callee_app_code: callee.app_code,
    result,
    decision_reason: result === 'SUCCESS' ? '授权关系命中，调用放行' : result === 'FAIL' ? '调用方未被授权访问目标 API' : '旁路策略命中，本次调用跳过鉴权',
    log_time: dateTime(index + 1, 7 + (index % 14), (index * 5) % 60)
  };
}).sort((a, b) => b.log_time.localeCompare(a.log_time));

export const dashboardActivities: {
  imports: ActivityRecord[];
  auths: ActivityRecord[];
  calls: ActivityRecord[];
} = {
  imports: [
    { id: 1, title: '批量 SmartDoc 导入完成', description: `已生成 ${versionHistories.length} 条版本记录`, time: smartDocImportLogs[0]?.create_time || '2026-04-22 09:10:00' },
    { id: 2, title: 'API 资产扩容完成', description: `当前 mock API 总量 ${apis.length} 条`, time: '2026-04-22 10:20:00' }
  ],
  auths: [
    { id: 3, title: '授权关系批量生成', description: `当前单应用授权关系 ${singleAppAuthorizations.length} 条`, time: authConfigLogs[0]?.log_time || '2026-04-22 10:00:00' },
    { id: 4, title: 'API 分组权限同步', description: `当前 API 分组总量 ${apiGroups.length} 条`, time: '2026-04-21 17:20:00' }
  ],
  calls: [
    { id: 5, title: '远程调用日志生成', description: `当前远程调用日志 ${remoteCallLogs.length} 条`, time: remoteCallLogs[0]?.log_time || '2026-04-22 10:15:00' },
    { id: 6, title: '鉴权失败样本生成', description: '已包含 SUCCESS、FAIL、BYPASS 三类结果', time: '2026-04-22 10:18:00' }
  ]
};
