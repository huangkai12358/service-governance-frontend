import { success, wait } from '@/utils/mock';
import type { HttpMethod, SmartDocDiffResult, VersionDiffItem } from '@/types/business';

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const resources = [
  { code: 'refund', name: '退款单' },
  { code: 'payment', name: '支付单' },
  { code: 'settlement', name: '结算单' },
  { code: 'channel', name: '支付渠道' },
  { code: 'risk', name: '支付风控' },
  { code: 'account', name: '资金账户' },
  { code: 'reconcile', name: '对账任务' },
  { code: 'receipt', name: '支付凭证' },
  { code: 'limit', name: '支付限额' },
  { code: 'route', name: '路由规则' }
];
const actions = [
  { code: 'create', name: '创建' },
  { code: 'detail', name: '查询详情' },
  { code: 'list', name: '分页查询' },
  { code: 'submit', name: '提交' },
  { code: 'sync', name: '同步' },
  { code: 'check', name: '校验' },
  { code: 'cancel', name: '取消' },
  { code: 'export', name: '导出' }
];

function createDiffApi(id: number, prefix: string): VersionDiffItem {
  const resource = resources[id % resources.length];
  const action = actions[id % actions.length];
  return {
    id,
    app_code: 'pay-gateway',
    app_name: '支付网关',
    api_name: `${action.name}${resource.name}`,
    api_path: `/api/pay/${resource.code}/${prefix}-${action.code}-${String(id).padStart(3, '0')}`,
    api_method: methods[id % methods.length],
    api_description: `支付网关${resource.name}${action.name}能力，来自本次 SmartDoc 差异分析`
  };
}

const additions = Array.from({ length: 18 }, (_, index) => createDiffApi(300001 + index, 'new'));
const deletions = Array.from({ length: 14 }, (_, index) => createDiffApi(390001 + index, 'legacy'));
const modifications = Array.from({ length: 16 }, (_, index) => {
  const after = createDiffApi(310001 + index, 'changed');
  return {
    id: 400001 + index,
    before: {
      ...after,
      id: 410001 + index,
      api_name: `${after.api_name}旧版`,
      api_method: index % 3 === 0 ? 'GET' as const : after.api_method,
      api_description: '旧版接口说明，缺少鉴权范围、幂等策略和异常码描述'
    },
    after,
    changed_fields: index % 3 === 0 ? ['api_name', 'api_method', 'api_description'] as const : ['api_name', 'api_description'] as const
  };
});

const smartDocDiff: SmartDocDiffResult = {
  draft: {
    app_code: 'pay-gateway',
    version: 'v3.1.0',
    remark: '支付网关 SmartDoc 文档导入，包含支付、退款、结算与对账接口变更',
    file_name: 'pay-gateway-smartdoc-20260422.json',
    file_path: '/data/smartdoc/pay-gateway/pay-gateway-smartdoc-20260422.json'
  },
  additions,
  modifications: modifications.map((item) => ({
    ...item,
    changed_fields: [...item.changed_fields]
  })),
  deletions
};

export async function analyzeSmartDoc() {
  return wait(success(smartDocDiff), 1000);
}

export async function confirmSmartDocImport() {
  return wait(success(true, 'SmartDoc 导入成功'));
}
