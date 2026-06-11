import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Send, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { ProcurementBatch } from '../data/types';

export default function ProcurementPlan() {
  const { batches, suppliers, addBatch, updateBatch, deleteBatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProcurementBatch | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingBatchId, setInvitingBatchId] = useState<string | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '紫皮' as '紫皮' | '白皮',
    grade: '一级' as '特级' | '一级' | '二级',
    quantity: 0,
    unitPrice: 0,
    deliveryDate: '',
    deliveryLocation: '',
    qualityStandard: ''
  });

  const handleSubmit = () => {
    const budgetTotal = formData.quantity * formData.unitPrice;
    const now = new Date().toISOString().split('T')[0];

    if (editingBatch) {
      updateBatch(editingBatch.id, {
        ...formData,
        budgetTotal,
        updatedAt: now
      });
    } else {
      const newBatch: ProcurementBatch = {
        id: `batch-${Date.now()}`,
        batchNumber: `PO-2024-${String(batches.length + 1).padStart(3, '0')}`,
        ...formData,
        budgetTotal,
        status: '草稿',
        invitedSuppliers: [],
        createdAt: now,
        updatedAt: now
      };
      addBatch(newBatch);
    }

    setShowModal(false);
    setEditingBatch(null);
    setFormData({
      name: '',
      type: '紫皮',
      grade: '一级',
      quantity: 0,
      unitPrice: 0,
      deliveryDate: '',
      deliveryLocation: '',
      qualityStandard: ''
    });
  };

  const handleEdit = (batch: ProcurementBatch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      type: batch.type,
      grade: batch.grade,
      quantity: batch.quantity,
      unitPrice: batch.unitPrice,
      deliveryDate: batch.deliveryDate,
      deliveryLocation: batch.deliveryLocation,
      qualityStandard: batch.qualityStandard
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个采购批次吗？')) {
      deleteBatch(id);
    }
  };

  const handlePublish = (batchId: string) => {
    updateBatch(batchId, {
      status: '招标中',
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleInviteSuppliers = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setInvitingBatchId(batchId);
      setSelectedSuppliers(batch.invitedSuppliers);
      setShowInviteModal(true);
    }
  };

  const handleSaveInvitations = () => {
    if (invitingBatchId) {
      updateBatch(invitingBatchId, {
        invitedSuppliers: selectedSuppliers,
        status: selectedSuppliers.length > 0 ? '招标中' : '招标中',
        updatedAt: new Date().toISOString().split('T')[0]
      });
    }
    setShowInviteModal(false);
    setInvitingBatchId(null);
    setSelectedSuppliers([]);
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
    草稿: 'default',
    招标中: 'info',
    竞价中: 'warning',
    已截止: 'danger',
    已完成: 'success'
  };

  const approvedSuppliers = suppliers.filter(s => s.status === '已通过');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">采购计划</h1>
          <p className="text-gray-600 mt-1">管理年度采购计划，创建采购批次</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          创建批次
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  批次信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  规格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量/预算
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交付信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  已邀请供应商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{batch.name}</p>
                      <p className="text-sm text-gray-500">{batch.batchNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {batch.type} · {batch.grade}
                    </div>
                    <div className="text-sm text-gray-500">
                      {batch.qualityStandard}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {batch.quantity}吨
                    </div>
                    <div className="text-sm text-gray-500">
                      ¥{batch.budgetTotal.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {batch.deliveryDate}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {batch.deliveryLocation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {batch.invitedSuppliers.length}家
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[batch.status]}>
                      {batch.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {batch.status === '草稿' && (
                        <>
                          <button
                            onClick={() => handleInviteSuppliers(batch.id)}
                            className="p-1 hover:bg-emerald-50 rounded"
                            title="邀请供应商"
                          >
                            <Users className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handlePublish(batch.id)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="发布招标"
                          >
                            <Send className="w-4 h-4 text-blue-600" />
                          </button>
                        </>
                      )}
                      {(batch.status === '招标中' || batch.status === '竞价中') && (
                        <button
                          onClick={() => handleInviteSuppliers(batch.id)}
                          className="p-1 hover:bg-emerald-50 rounded"
                          title="管理供应商"
                        >
                          <Users className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(batch)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      {batch.status === '草稿' && (
                        <button
                          onClick={() => handleDelete(batch.id)}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBatch ? '编辑采购批次' : '创建采购批次'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  批次名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：2024年春季大蒜采购"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    大蒜类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as '紫皮' | '白皮'
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="紫皮">紫皮</option>
                    <option value="白皮">白皮</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    等级
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade: e.target.value as '特级' | '一级' | '二级'
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="特级">特级</option>
                    <option value="一级">一级</option>
                    <option value="二级">二级</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数量（吨）
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    单价（元/吨）
                  </label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitPrice: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交付日期
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交付地点
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="例如：上海市浦东新区"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  质量标准
                </label>
                <textarea
                  value={formData.qualityStandard}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualityStandard: e.target.value
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：直径≥5cm，无发芽，无腐烂"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingBatch(null);
                }}
              >
                取消
              </Button>
              <Button onClick={handleSubmit}>
                {editingBatch ? '保存修改' : '创建批次'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              邀请供应商参与竞价
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              选择要邀请的供应商（已通过的供应商）
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {approvedSuppliers.map((supplier) => (
                <label
                  key={supplier.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSuppliers.includes(supplier.id)
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={() => toggleSupplier(supplier.id)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {supplier.companyName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplier.contactPerson} · {supplier.location}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">
                    信用分: {supplier.creditScore}
                  </span>
                </label>
              ))}

              {approvedSuppliers.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  暂无已通过的供应商
                </p>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                已选择: <span className="font-medium text-gray-900">{selectedSuppliers.length}</span> 家供应商
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowInviteModal(false);
                  setInvitingBatchId(null);
                  setSelectedSuppliers([]);
                }}
              >
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
