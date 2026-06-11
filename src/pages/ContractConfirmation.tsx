import { useState } from 'react';
import { FileCheck, Search, Clock, CheckCircle, Download, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function ContractConfirmation() {
  const navigate = useNavigate();
  const { contracts, orders, updateContract, updateOrder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === '全部' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
    待确认: 'warning',
    已签署: 'success',
    执行中: 'info',
    已完成: 'success'
  };

  const handleSign = (contractId: string) => {
    if (window.confirm('确认签署此合同？签署后将无法撤回。')) {
      const contract = contracts.find(c => c.id === contractId);
      
      updateContract(contractId, {
        status: '已签署',
        signedAt: new Date().toISOString().split('T')[0]
      });

      if (contract) {
        const relatedOrder = orders.find(o => o.contractId === contractId);
        if (relatedOrder) {
          updateOrder(relatedOrder.id, { status: '待发货' });
          alert(`合同签署成功！\n已关联订单: ${relatedOrder.id}\n订单状态已更新为待发货，可前往履约跟踪查看`);
        } else {
          alert('合同签署成功！');
        }
      }
    }
  };

  const handleDownload = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    const content = `
大蒜采购合同
================================================================================

合同编号: ${contract.contractNumber}
签订日期: ${contract.createdAt}
签署日期: ${contract.signedAt || '待签署'}

--------------------------------------------------------------------------------
甲方（采购方）:
  公司名称: 大蒜采购竞价平台
  地址: 上海市浦东新区

乙方（供应方）:
  公司名称: ${contract.supplierName}

--------------------------------------------------------------------------------
合同标的:
  采购批次: ${contract.batchName}
  合同金额: ¥${contract.totalAmount.toLocaleString()}
  交付日期: ${contract.deliveryDate}
  付款方式: ${contract.paymentTerms}

--------------------------------------------------------------------------------
质量标准:
  符合国家相关食品质量安全标准
  直径≥5cm，无发芽，无腐烂

--------------------------------------------------------------------------------
违约责任:
  1. 甲方逾期付款，应按日支付合同金额的0.5%作为违约金
  2. 乙方逾期交货，应按日支付合同金额的0.5%作为违约金
  3. 质量不符合标准的，乙方应无条件退货并承担相应费用

--------------------------------------------------------------------------------
争议解决:
  本合同在履行过程中发生的争议，双方应协商解决；协商不成的，提交合同
  签订地有管辖权的人民法院诉讼解决。

--------------------------------------------------------------------------------
合同状态: ${contract.status}

================================================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `合同_${contract.contractNumber}_${contract.supplierName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">合同确认</h1>
          <p className="text-gray-600 mt-1">采购合同生成与双方确认</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">
            {contracts.filter((c) => c.status === '待确认').length} 待确认
          </Badge>
          <Badge variant="success">
            {contracts.filter((c) => c.status === '已签署' || c.status === '执行中').length} 已签署
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索合同编号或供应商..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="全部">全部状态</option>
            <option value="待确认">待确认</option>
            <option value="已签署">已签署</option>
            <option value="执行中">执行中</option>
            <option value="已完成">已完成</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedContract === contract.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedContract(contract.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {contract.contractNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {contract.supplierName}
                      </p>
                    </div>
                    <Badge variant={statusColors[contract.status]}>
                      {contract.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">批次</p>
                      <p className="text-sm font-medium text-gray-900">
                        {contract.batchName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">合同金额</p>
                      <p className="text-sm font-medium text-emerald-600">
                        ¥{contract.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">交付日期</p>
                      <p className="text-sm font-medium text-gray-900">
                        {contract.deliveryDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">付款方式</p>
                      <p className="text-sm font-medium text-gray-900">
                        {contract.paymentTerms}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>创建: {contract.createdAt}</span>
                      </div>
                      {contract.signedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>签署: {contract.signedAt}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Download}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(contract.id);
                        }}
                      >
                        下载
                      </Button>
                      {contract.status === '待确认' && (
                        <Button
                          size="sm"
                          icon={Send}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSign(contract.id);
                          }}
                        >
                          确认签署
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredContracts.length === 0 && (
                <div className="text-center py-12">
                  <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">未找到符合条件的合同</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">合同详情预览</h3>

              {selectedContract ? (
                (() => {
                  const contract = contracts.find(
                    (c) => c.id === selectedContract
                  );
                  if (!contract) return null;
                  
                  const relatedOrder = orders.find(o => o.contractId === contract.id);

                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">合同编号</p>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.contractNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">采购批次</p>
                        <p className="text-sm text-gray-900">
                          {contract.batchName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">供应商</p>
                        <p className="text-sm text-gray-900">
                          {contract.supplierName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">合同金额</p>
                        <p className="text-lg font-bold text-emerald-600">
                          ¥{contract.totalAmount.toLocaleString()}
                        </p>
                      </div>

                      {relatedOrder && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-blue-700 font-medium">关联订单</span>
                            <Badge variant={relatedOrder.status === '待发货' ? 'warning' : relatedOrder.status === '已完成' ? 'success' : 'info'} size="sm">
                              {relatedOrder.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-blue-600">订单号: {relatedOrder.id}</p>
                          <p className="text-xs text-blue-600">物流: {relatedOrder.logisticsNumber}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={ExternalLink}
                            className="w-full mt-2"
                            onClick={() => navigate('/performance')}
                          >
                            去履约跟踪
                          </Button>
                        </div>
                      )}

                      {!relatedOrder && contract.status === '待确认' && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 text-center">
                            签署合同后将自动创建订单
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          合同条款
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• 交付时间: {contract.deliveryDate}</li>
                          <li>• 付款方式: {contract.paymentTerms}</li>
                          <li>• 质量标准: 符合国家相关标准</li>
                          <li>• 违约责任: 按合同法执行</li>
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          签署状态
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">采购方</span>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm text-emerald-600">
                                已签署
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">供应商</span>
                            <div
                              className={`flex items-center gap-1 ${
                                contract.status === '已签署'
                                  ? 'text-emerald-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {contract.status === '已签署' ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">已签署</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm">待签署</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {contract.status === '待确认' && (
                        <div className="pt-4 border-t border-gray-200">
                          <Button
                            className="w-full"
                            icon={CheckCircle}
                            onClick={() => handleSign(contract.id)}
                          >
                            确认签署
                          </Button>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          className="w-full"
                          icon={Download}
                          onClick={() => handleDownload(contract.id)}
                        >
                          下载合同文件
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  点击左侧合同查看详情
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
