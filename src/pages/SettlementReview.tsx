import { useState } from 'react';
import { Calculator, TrendingUp, Clock, Award, DollarSign, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { statisticsData } from '../data/mockData';

export default function SettlementReview() {
  const { settlements, suppliers } = useStore();
  const [timeRange, setTimeRange] = useState('month');

  const paidSettlements = settlements.filter((s) => s.status === '已付款');
  const pendingSettlements = settlements.filter((s) => s.status === '待付款');

  const totalPaid = paidSettlements.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalPending = pendingSettlements.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalDeductions = paidSettlements.reduce((sum, s) => sum + s.deductions, 0);
  const totalReplenishment = paidSettlements.reduce((sum, s) => sum + s.replenishment, 0);

  const supplierRankings = suppliers
    .filter((s) => s.status === '已通过')
    .sort((a, b) => b.creditScore - a.creditScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">结算复盘</h1>
          <p className="text-gray-600 mt-1">补货扣款、节省金额、供应商排名</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
          <Button icon={Download} variant="outline">
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Calculator className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">已付款总额</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">待付款</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总扣款</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalDeductions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">采购节省率</p>
              <p className="text-2xl font-bold text-emerald-600">
                {statisticsData.savingsRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              结算明细
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      供应商
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      合同金额
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      扣款
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      补货
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      最终金额
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {settlement.supplierName}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        ¥{settlement.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {settlement.deductions > 0
                          ? `-¥${settlement.deductions.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-emerald-600">
                        {settlement.replenishment > 0
                          ? `+¥${settlement.replenishment.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ¥{settlement.finalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            settlement.status === '已付款' ? 'success' : 'warning'
                          }
                          size="sm"
                        >
                          {settlement.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {settlements.length === 0 && (
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无结算数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              供应商排名
            </h2>

            <div className="space-y-4">
              {supplierRankings.map((supplier, index) => (
                <div
                  key={supplier.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {supplier.companyName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplier.contactPerson}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {supplier.creditScore}
                    </p>
                    <p className="text-xs text-gray-500">信用分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              核心指标
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">准时交货率</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {statisticsData.onTimeRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${statisticsData.onTimeRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">质量合格率</span>
                  <span className="text-lg font-bold text-blue-600">
                    {statisticsData.qualityRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${statisticsData.qualityRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">采购节省率</span>
                  <span className="text-lg font-bold text-orange-600">
                    {statisticsData.savingsRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${statisticsData.savingsRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">总节省金额</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ¥{statisticsData.totalSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
