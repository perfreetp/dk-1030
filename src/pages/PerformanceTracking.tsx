import { useState } from 'react';
import { Truck, Package, CheckCircle, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function PerformanceTracking() {
  const { orders, updateOrder } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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

  const handleReportIssue = (orderId: string) => {
    alert(`为订单 ${orderId} 报告问题`);
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportIssue(order.id);
                          }}
                        >
                          报告问题
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, '质检中');
                            }}
                          >
                            开始质检
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

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        异常记录
                      </h4>
                      {order.issues.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          暂无异常记录
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {order.issues.map((issue) => (
                            <div
                              key={issue.id}
                              className="p-2 bg-red-50 rounded text-sm"
                            >
                              <p className="text-red-700">{issue.type}</p>
                              <p className="text-red-600 text-xs mt-1">
                                {issue.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
    </div>
  );
}
