import {
  ClipboardList,
  Users,
  FileCheck,
  Truck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { statisticsData } from '../data/mockData';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

export default function Dashboard() {
  const { batches, contracts, orders, suppliers } = useStore();

  const activeBatches = batches.filter(
    (b) => b.status === '竞价中' || b.status === '招标中'
  );
  const recentContracts = contracts.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-600 mt-1">大蒜跨区采购竞价平台数据概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="采购批次数"
          value={batches.length}
          icon={ClipboardList}
          trend={{ value: 12, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="活跃供应商"
          value={activeBatches.length}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="采购节省率"
          value={`${statisticsData.savingsRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.3, isPositive: true }}
          color="orange"
        />
        <StatCard
          title="准时交货率"
          value={`${statisticsData.onTimeRate}%`}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">进行中的招标</h2>
            <Link
              to="/bidding"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {activeBatches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{batch.name}</p>
                  <p className="text-sm text-gray-600">
                    {batch.type} · {batch.grade} · {batch.quantity}吨
                  </p>
                </div>
                <Badge
                  variant={
                    batch.status === '竞价中'
                      ? 'warning'
                      : batch.status === '招标中'
                      ? 'info'
                      : 'default'
                  }
                >
                  {batch.status}
                </Badge>
              </div>
            ))}
            {activeBatches.length === 0 && (
              <p className="text-center text-gray-500 py-4">暂无进行中的招标</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">供应商概览</h2>
            <Link
              to="/suppliers"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter((s) => s.status === '已通过').length}
              </p>
              <p className="text-sm text-gray-600">已通过</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter((s) => s.status === '待审核').length}
              </p>
              <p className="text-sm text-gray-600">待审核</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近合同</h2>
            <Link
              to="/contract"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {contract.contractNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {contract.supplierName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ¥{contract.totalAmount.toLocaleString()}
                  </p>
                  <Badge
                    variant={
                      contract.status === '已完成'
                        ? 'success'
                        : contract.status === '执行中'
                        ? 'info'
                        : 'default'
                    }
                    size="sm"
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">订单追踪</h2>
            <Link
              to="/fulfillment"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {order.supplierName}
                  </p>
                  <p className="text-sm text-gray-600">
                    物流单号: {order.logisticsNumber}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === '已到货'
                      ? 'success'
                      : order.status === '运输中'
                      ? 'info'
                      : order.status === '质检中'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
