import { success, wait } from '@/utils/mock';
import type { SmartDocDiffResult } from '@/types/business';

const smartDocDiff: SmartDocDiffResult = {
  draft: {
    app_code: 'pay-gateway',
    version: 'v3.0.2',
    remark: '支付网关 SmartDoc 文档导入',
    file_name: 'pay-gateway-smartdoc-20260422.json',
    file_path: '/data/smartdoc/pay-gateway/pay-gateway-smartdoc-20260422.json'
  },
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
    },
    {
      id: 'mod-02',
      before: { id: 'api-09-old', app_code: 'pay-gateway', app_name: '支付网关', api_name: '发起退款', api_path: '/api/pay/refund', api_method: 'POST', api_description: '提交退款单并发起原路退回' },
      after: { id: 'api-09', app_code: 'pay-gateway', app_name: '支付网关', api_name: '发起退款申请', api_path: '/api/pay/refund', api_method: 'POST', api_description: '提交退款申请并更新退款状态机' },
      changed_fields: ['api_name', 'api_description']
    }
  ],
  deletions: [
    { id: 'legacy-01', app_code: 'pay-gateway', app_name: '支付网关', api_name: '查询旧版支付参数', api_path: '/api/pay/legacy/options', api_method: 'GET', api_description: '旧版支付参数查询接口' }
  ]
};

export async function analyzeSmartDoc() {
  return wait(success(smartDocDiff), 1000);
}

export async function confirmSmartDocImport() {
  return wait(success(true, 'SmartDoc 导入成功'));
}
