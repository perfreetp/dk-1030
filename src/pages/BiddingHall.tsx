import { useState } from 'react';
import { Search, Filter, Clock, Users, Plus, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function BiddingHall() {
  const { batches, suppliers, updateBatch } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingBatchId, setInvitingBatchId] = useState<string | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '全部' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
    草稿: 'default',
    招标中: 'info',
    竞价中: 'warning',
    已截止: 'danger',
    已完成: 'success'
  };

  const handlePublish = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      const newStatus = batch.status === '草稿' ? '招标中' : '竞价中';
      updateBatch(batchId, {
        status: newStatus,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      alert(`已将 "${batch.name}" 状态更新为: ${newStatus}`);
    }
  };

  const handleInvite = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      setInvitingBatchId(batchId);
      setSelectedSuppliers(batch.invitedSuppliers || []);
      setShowInviteModal(true);
    }
  };

  const handleSaveInvitations = () => {
    if (invitingBatchId) {
      updateBatch(invitingBatchId, {
        invitedSuppliers: selectedSuppliers,
        status: '招标中',
        updatedAt: new Date().toISOString().split('T')[0]
      });
      const batch = batches.find(b => b.id === invitingBatchId);
      alert(`已为 "${batch?.name}" 邀请 ${selectedSuppliers.length} 家供应商`);
      setShowInviteModal(false);
    }
  };

  const getInvitedSupplierCount = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.invitedSuppliers?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">招标大厅</h1>
          <p className="text-gray-600 mt-1">发布和管理招标公告，邀请供应商参与竞价</p>
        </div>
        <Button icon={Plus}>发布招标</Button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索批次名称或编号..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="全部">全部状态</option>
              <option value="草稿">草稿</option>
              <option value="招标中">招标中</option>
              <option value="竞价中">竞价中</option>
              <option value="已截止">已截止</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                    selectedBatch === batch.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedBatch(batch.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                      <p className="text-sm text-gray-500">{batch.batchNumber}</p>
                    </div>
                    <Badge variant={statusColors[batch.status]}>
                      {batch.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">规格</p>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.type} · {batch.grade}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">数量</p>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.quantity}吨
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">预算</p>
                      <p className="text-sm font-medium text-gray-900">
                        ¥{batch.budgetTotal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">交付日期</p>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.deliveryDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{getInvitedSupplierCount(batch.id)}家供应商已邀请</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>剩余5天</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {batch.status === '草稿' && (
                        <Button
                          size="sm"
                          icon={Send}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(batch.id);
                          }}
                        >
                          发布
                        </Button>
                      )}
                      {(batch.status === '招标中' || batch.status === '竞价中') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite(batch.id);
                          }}
                        >
                          邀请供应商
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredBatches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">未找到符合条件的招标批次</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">招标详情</h3>

              {selectedBatch ? (
                (() => {
                  const batch = batches.find((b) => b.id === selectedBatch);
                  if (!batch) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">批次名称</p>
                        <p className="text-sm font-medium text-gray-900">
                          {batch.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">质量标准</p>
                        <p className="text-sm text-gray-700">
                          {batch.qualityStandard}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">交付地点</p>
                        <p className="text-sm text-gray-700">
                          {batch.deliveryLocation}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          竞价规则
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• 多轮竞价，价格递减</li>
                          <li>• 每轮报价有效期24小时</li>
                          <li>• 最终确认后生成合同</li>
                          <li>• 含税含运价格汇总</li>
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          时间节点
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">创建时间</span>
                            <span className="text-gray-900">
                              {batch.createdAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">招标开始</span>
                            <span className="text-gray-900">
                              {batch.updatedAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">截止时间</span>
                            <span className="text-gray-900">
                              {batch.deliveryDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          已邀请供应商
                        </h4>
                        {batch.invitedSuppliers && batch.invitedSuppliers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {batch.invitedSuppliers.map(supplierId => {
                              const supplier = suppliers.find(s => s.id === supplierId);
                              return supplier ? (
                                <span key={supplierId} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                  {supplier.companyName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">暂无已邀请供应商</p>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  点击左侧批次查看详情
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              邀请供应商
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              选择要邀请的供应商（可多选）
            </p>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
              {suppliers.filter(s => s.status === '已通过').map(supplier => (
                <label
                  key={supplier.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                      } else {
                        setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                      }
                    }}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{supplier.companyName}</p>
                    <p className="text-xs text-gray-500">{supplier.contactPerson} · {supplier.phone}</p>
                  </div>
                </label>
              ))}
              {suppliers.filter(s => s.status === '已通过').length === 0 && (
                <p className="text-center text-gray-500 py-4">暂无可邀请的供应商</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                取消
              </Button>
              <Button onClick={handleSaveInvitations}>
                确认邀请 ({selectedSuppliers.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
