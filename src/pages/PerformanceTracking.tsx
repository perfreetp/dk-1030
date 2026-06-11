import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, CheckCircle, AlertTriangle, MapPin, Clock, Plus, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { QualityCheck, Issue } from '../data/types';

export default function PerformanceTracking() {
  const navigate = useNavigate();
  const { orders, contracts, updateOrder, addSettlement } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [qualityScores, setQualityScores] = useState({
    appearanceScore: 85,
    specScore: 85,
    qualityScore: 85,
    tasteScore: 85
  });
  const [qualityPassed, setQualityPassed] = useState(true);
  const [qualityNotes, setQualityNotes] = useState('');
  const [issueForm, setIssueForm] = useState({
    type: '破损' as '破损' | '延迟' | '质量不符',
    description: '',
    amount: 0
  });

  const statusIcons: Record<string, React.ReactNode> = {
    待发货: <Package className="w-5 h-5 text-gray-600" />,
    运输中: <Truck className="w-5 h-5 text-blue-600" />,
    已到货: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    质检中: <AlertTriangle className="w-5 h-5 text-orange-600" />
  };

  const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    待发货: 'default',
    运输中: 'info',
    已到货: 'success',
    质检中: 'warning'
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateOrder(orderId, { status: newStatus as any });
  };

  const handleQualitySubmit = () => {
    if (!selectedOrder) return;

    const totalScore =
      (qualityScores.appearanceScore +
        qualityScores.specScore +
        qualityScores.qualityScore +
        qualityScores.tasteScore) / 4;

    const qualityCheck: QualityCheck = {
      id: `qc-${Date.now()}`,
      appearanceScore: qualityScores.appearanceScore,
      specScore: qualityScores.specScore,
      qualityScore: qualityScores.qualityScore,
      tasteScore: qualityScores.tasteScore,
      totalScore,
      passed: qualityPassed,
      notes: qualityNotes,
      checkedAt: new Date().toISOString().split('T')[0]
    };

    updateOrder(selectedOrder, {
      status: '质检中',
      qualityCheck
    });

    const order = orders.find(o => o.id === selectedOrder);
    if (order && qualityPassed) {
      handleUpdateStatus(selectedOrder, '质检中');
    }

    setShowQualityModal(false);
  };

  const handleIssueSubmit = () => {
    if (!selectedOrder) return;

    const order = orders.find(o => o.id === selectedOrder);
    if (!order) return;

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      type: issueForm.type,
      description: issueForm.description,
      amount: issueForm.amount,
      status: '待处理',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedIssues = [...order.issues, newIssue];
    updateOrder(selectedOrder, { issues: updatedIssues });

    if (issueForm.amount > 0) {
      const contract = contracts.find(c => c.id === order.contractId);
      if (contract) {
        addSettlement({
          id: `settle-${Date.now()}`,
          contractId: order.contractId,
          orderId: order.id,
          supplierName: order.supplierName,
          totalAmount: contract.totalAmount,
          deductions: issueForm.type === '破损' || issueForm.type === '质量不符' ? issueForm.amount : 0,
          replenishment: issueForm.type === '延迟' ? issueForm.amount : 0,
          finalAmount: contract.totalAmount - (issueForm.type === '破损' || issueForm.type === '质量不符' ? issueForm.amount : 0) + (issueForm.type === '延迟' ? issueForm.amount : 0),
          status: '待付款',
          paidAt: ''
        });
      }
    }

    setShowIssueModal(false);
    setIssueForm({
      type: '破损',
      description: '',
      amount: 0
    });

    alert('异常已记录，相关结算信息已流转至结算复盘页面');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">履约跟踪</h1>
          <p className="text-gray-600 mt-1">发货、物流、到货全流程跟踪</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">
            {orders.filter((o) => o.status === '运输中').length} 运输中
          </Badge>
          <Badge variant="success">
            {orders.filter((o) => o.status === '已到货').length} 已到货
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">订单列表</h2>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedOrder === order.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {statusIcons[order.status]}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.supplierName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          订单号: {order.id}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">数量</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.quantity}吨
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">物流单号</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.logisticsNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">预计到货</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.actualDeliveryDate}
                      </p>
                    </div>
                  </div>

                  {order.qualityCheck && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          质检评分: {order.qualityCheck.totalScore.toFixed(1)}
                        </span>
                        <Badge variant={order.qualityCheck.passed ? 'success' : 'danger'} size="sm">
                          {order.qualityCheck.passed ? '合格' : '不合格'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {order.issues.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        异常记录: {order.issues.length}条
                      </p>
                      {order.issues.map((issue) => (
                        <div key={issue.id} className="text-sm text-red-600">
                          {issue.type} - ¥{issue.amount}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>物流轨迹追踪中</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={AlertTriangle}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order.id);
                            setShowIssueModal(true);
                          }}
                        >
                          异常处理
                        </Button>
                        {order.status === '待发货' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, '运输中');
                            }}
                          >
                            确认发货
                          </Button>
                        )}
                        {order.status === '运输中' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, '已到货');
                            }}
                          >
                            确认到货
                          </Button>
                        )}
                        {order.status === '已到货' && (
                          <Button
                            size="sm"
                            icon={CheckCircle}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order.id);
                              setShowQualityModal(true);
                            }}
                          >
                            质检登记
                          </Button>
                        )}
                        {order.status === '质检中' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, '已完成');
                              navigate('/settlement');
                            }}
                          >
                            完成质检
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无订单数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">物流追踪</h3>

            {selectedOrder ? (
              (() => {
                const order = orders.find((o) => o.id === selectedOrder);
                if (!order) return null;

                return (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        物流信息
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">物流单号</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.logisticsNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">承运商</p>
                          <p className="text-sm font-medium text-gray-900">
                            顺丰速运
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">预计到达</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.actualDeliveryDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        物流轨迹
                      </h4>
                      <div className="space-y-4">
                        {[
                          {
                            time: '2024-03-15 10:30',
                            location: '郑州分拨中心',
                            status: '已发出'
                          },
                          {
                            time: '2024-03-14 18:20',
                            location: '开封集散点',
                            status: '运输中'
                          },
                          {
                            time: '2024-03-14 09:15',
                            location: '供应商仓库',
                            status: '已揽收'
                          }
                        ].map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                              {index < 2 && (
                                <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium text-gray-900">
                                {item.location}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.time}
                              </p>
                              <p className="text-xs text-emerald-600 mt-1">
                                {item.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.qualityCheck && (
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          质检结果
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">外观</span>
                            <span className="font-medium">
                              {order.qualityCheck.appearanceScore}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">规格</span>
                            <span className="font-medium">
                              {order.qualityCheck.specScore}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">品质</span>
                            <span className="font-medium">
                              {order.qualityCheck.qualityScore}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">口感</span>
                            <span className="font-medium">
                              {order.qualityCheck.tasteScore}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                            <span>综合评分</span>
                            <span className="text-emerald-600">
                              {order.qualityCheck.totalScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-gray-500 text-center">
                点击左侧订单查看物流追踪
              </p>
            )}
          </div>
        </div>
      </div>

      {showQualityModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">质检登记</h2>

            <div className="space-y-4">
              {[
                { key: 'appearanceScore', label: '外观评分' },
                { key: 'specScore', label: '规格评分' },
                { key: 'qualityScore', label: '品质评分' },
                { key: 'tasteScore', label: '口感评分' }
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label} (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={qualityScores[item.key as keyof typeof qualityScores]}
                    onChange={(e) =>
                      setQualityScores({
                        ...qualityScores,
                        [item.key]: parseInt(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-500">0</span>
                    <span className="font-bold text-emerald-600">
                      {qualityScores[item.key as keyof typeof qualityScores]}
                    </span>
                    <span className="text-gray-500">100</span>
                  </div>
                </div>
              ))}

              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-900">综合评分</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {(
                      (qualityScores.appearanceScore +
                        qualityScores.specScore +
                        qualityScores.qualityScore +
                        qualityScores.tasteScore) /
                      4
                    ).toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  质检结论
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={qualityPassed}
                      onChange={() => setQualityPassed(true)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-gray-700">合格</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!qualityPassed}
                      onChange={() => setQualityPassed(false)}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-gray-700">不合格</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="输入质检备注..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowQualityModal(false)}>
                取消
              </Button>
              <Button icon={Save} onClick={handleQualitySubmit}>
                保存质检结果
              </Button>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">异常处理</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  异常类型
                </label>
                <select
                  value={issueForm.type}
                  onChange={(e) => setIssueForm({ ...issueForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="破损">破损</option>
                  <option value="延迟">延迟</option>
                  <option value="质量不符">质量不符</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  异常描述
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="详细描述异常情况..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {issueForm.type === '延迟' ? '延迟赔偿金额' : '扣款金额'}（元）
                </label>
                <input
                  type="number"
                  value={issueForm.amount || ''}
                  onChange={(e) => setIssueForm({ ...issueForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="输入金额"
                />
              </div>

              <div className="bg-orange-50 rounded-lg p-4 text-sm">
                <p className="text-orange-800">
                  {issueForm.type === '破损' && '破损问题将从结算金额中扣除相应款项'}
                  {issueForm.type === '延迟' && '延迟交付将产生相应赔偿金额'}
                  {issueForm.type === '质量不符' && '质量不符将产生扣款，可能需要补货'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowIssueModal(false)}>
                取消
              </Button>
              <Button icon={Plus} onClick={handleIssueSubmit}>
                记录异常
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
