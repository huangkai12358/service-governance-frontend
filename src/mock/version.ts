import type { VersionDetail } from '@/types/business';
import { rollbackRecords, versions } from './base';
import { success, wait } from '@/utils/mock';

export async function fetchVersionList() {
  return wait(success(versions));
}

export async function fetchVersionDetail(id: string) {
  const base = versions.find((item) => item.id === id) || versions[0];
  const detail: VersionDetail = {
    base,
    changeList: [
      { id: 'ch-01', type: '新增', target: '查询退款明细', detail: '新增 GET /api/pay/refund/detail' },
      { id: 'ch-02', type: '修改', target: '支付预校验', detail: '描述增加风控策略判定说明' },
      { id: 'ch-03', type: '删除', target: '查询旧版支付参数', detail: '废弃旧版支付参数查询接口' }
    ],
    rollbackRecords: rollbackRecords.filter((item) => item.version === base.version)
  };
  return wait(success(detail));
}

export async function rollbackVersion(id: string) {
  return wait(success(id, '版本回滚成功'));
}
