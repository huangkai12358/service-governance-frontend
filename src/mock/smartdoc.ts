import type { SmartDocDiffResult } from '@/types/business';
import { success, wait } from '@/utils/mock';

const diffResult: SmartDocDiffResult = {
  version: {
    id: 'ver-04',
    version: '2026.04.21.02',
    importedAt: '2026-04-21 11:00:00',
    summary: '支付网关导入新增退款明细接口，调整支付预校验文档说明',
    changeCount: 5,
    status: 'CURRENT',
    scope: '支付网关 / 支付鉴权组'
  },
  additions: [
    { id: 'na-01', appName: '支付网关', name: '查询退款明细', path: '/api/pay/refund/detail', method: 'GET', description: '根据退款单号查询退款明细' },
    { id: 'na-02', appName: '支付网关', name: '幂等校验', path: '/api/pay/idempotent/check', method: 'POST', description: '支付提交前执行幂等校验' }
  ],
  modifications: [
    {
      id: 'mo-01',
      before: { id: 'api-05', appName: '支付网关', name: '支付预校验', path: '/api/pay/pre-check', method: 'POST', description: '校验支付单可执行性' },
      after: { id: 'api-05', appName: '支付网关', name: '支付预校验', path: '/api/pay/pre-check', method: 'POST', description: '校验支付单状态、限额及风控策略' },
      fields: ['description']
    },
    {
      id: 'mo-02',
      before: { id: 'api-14', appName: '支付网关', name: '发起退款', path: '/api/pay/refund', method: 'POST', description: '提交退款单并发起原路退回' },
      after: { id: 'api-14', appName: '支付网关', name: '发起退款申请', path: '/api/pay/refund', method: 'POST', description: '提交退款申请并同步更新退款状态机' },
      fields: ['name', 'description']
    }
  ],
  deletions: [
    { id: 'de-01', appName: '支付网关', name: '查询旧版支付参数', path: '/api/pay/legacy/options', method: 'GET', description: '旧版支付参数查询接口' }
  ]
};

export async function analyzeSmartDoc() {
  return wait(success(diffResult), 1200);
}

export async function confirmSmartDocImport(selectedIds: string[]) {
  return wait(success({ version: diffResult.version.version, selectedCount: selectedIds.length }, '导入成功'));
}
