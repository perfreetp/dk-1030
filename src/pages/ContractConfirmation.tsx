import { useState } from 'react';
import { FileCheck, Search, Clock, CheckCircle, Download, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function ContractConfirmation() {
  const { contracts } = useStore();
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
    alert(`合同 ${contractId} 已签署`);
  };

  const handleDownload = (contractId: string) => {
    alert(`下载合同 ${contractId}`);
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
                                  <Clock className="w-4 h-4" />
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
                            icon={Send}
                            onClick={() => handleSign(contract.id)}
                          >
                            发送签署链接
                          </Button>
                        </div>
                      )}
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
