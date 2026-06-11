import { useState } from 'react';
import { Search, Filter, Clock, Users, Plus, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function BiddingHall() {
  const { batches } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

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
      // In real app, this would update the store
      alert(`已将 "${batch.name}" 状态更新为: ${newStatus}`);
    }
  };

  const handleInvite = (batchId: string) => {
    alert('打开供应商邀请对话框');
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
                        <span>3家供应商报名</span>
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
    </div>
  );
}
