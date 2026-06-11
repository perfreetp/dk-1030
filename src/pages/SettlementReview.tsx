import { useState } from 'react';
import { Calculator, TrendingUp, Clock, Award, DollarSign, Download, Edit2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { statisticsData } from '../data/mockData';

export default function SettlementReview() {
  const { settlements, suppliers, contracts, batches, updateSettlement } = useStore();
  const [timeRange, setTimeRange] = useState('month');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [batchFilter, setBatchFilter] = useState<string>('全部');
  const [supplierFilter, setSupplierFilter] = useState<string>('全部');
  const [editForm, setEditForm] = useState({
    deductions: 0,
    replenishment: 0,
    status: '待付款' as '待付款' | '已付款'
  });

  const uniqueSuppliers = Array.from(new Set(settlements.map(s => s.supplierName)));
  const uniqueBatchNames = Array.from(new Set(contracts.map(c => c.batchName)));

  const filteredSettlements = settlements.filter((settlement) => {
    const contract = contracts.find(c => c.id === settlement.contractId);
    const matchesSupplier = supplierFilter === '全部' || settlement.supplierName === supplierFilter;
    const matchesBatch = batchFilter === '全部' || (contract && contract.batchName === batchFilter);
    return matchesSupplier && matchesBatch;
  });

  const paidSettlements = filteredSettlements.filter((s) => s.status === '已付款');
  const pendingSettlements = filteredSettlements.filter((s) => s.status === '待付款');

  const totalPaid = paidSettlements.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalPending = pendingSettlements.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalDeductions = filteredSettlements.reduce((sum, s) => sum + s.deductions, 0);
  const totalReplenishment = filteredSettlements.reduce((sum, s) => sum + s.replenishment, 0);

  const filteredSupplierData = suppliers
    .filter((s) => s.status === '已通过')
    .map(supplier => {
      const supplierSettlements = filteredSettlements.filter(s => s.supplierName === supplier.companyName);
      if (supplierSettlements.length === 0) return null;
      
      const totalAmount = supplierSettlements.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalDeduction = supplierSettlements.reduce((sum, s) => sum + s.deductions, 0);
      const totalReplenishmentAmount = supplierSettlements.reduce((sum, s) => sum + s.replenishment, 0);
      const finalAmount = supplierSettlements.reduce((sum, s) => sum + s.finalAmount, 0);
      const paidCount = supplierSettlements.filter(s => s.status === '已付款').length;
      const unpaidCount = supplierSettlements.filter(s => s.status === '待付款').length;
      const paymentRate = supplierSettlements.length > 0 ? (paidCount / supplierSettlements.length) * 100 : 0;
      const performanceScore = 
        supplier.creditScore * 0.3 + 
        (100 - (totalDeduction / (totalAmount || 1)) * 100) * 0.35 +
        paymentRate * 0.2 +
        (100 - (totalReplenishmentAmount / (totalAmount || 1)) * 100) * 0.15;
      
      return {
        ...supplier,
        totalAmount,
        totalDeduction,
        totalReplenishment: totalReplenishmentAmount,
        finalAmount,
        paidCount,
        unpaidCount,
        paymentRate,
        performanceScore: Math.max(0, Math.min(100, performanceScore))
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.performanceScore - a!.performanceScore);

  const handleEdit = (settlement: any) => {
    setEditingId(settlement.id);
    setEditForm({
      deductions: settlement.deductions,
      replenishment: settlement.replenishment,
      status: settlement.status
    });
  };

  const handleSave = (settlementId: string) => {
    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    const finalAmount = settlement.totalAmount - editForm.deductions + editForm.replenishment;
    
    updateSettlement(settlementId, {
      deductions: editForm.deductions,
      replenishment: editForm.replenishment,
      finalAmount,
      status: editForm.status,
      paidAt: editForm.status === '已付款' ? new Date().toISOString().split('T')[0] : ''
    });

    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

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
          <Button icon={Download} variant="outline" onClick={() => {
            const reportData = filteredSettlements.map(s => ({
              '供应商': s.supplierName,
              '合同金额': s.totalAmount,
              '扣款': s.deductions,
              '补货': s.replenishment,
              '最终金额': s.finalAmount,
              '付款状态': s.status
            }));
            
            const headers = ['供应商', '合同金额', '扣款', '补货', '最终金额', '付款状态'];
            const csvContent = [
              headers.join(','),
              ...reportData.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `结算报表_${batchFilter === '全部' ? '全部批次' : batchFilter}_${supplierFilter === '全部' ? '全部供应商' : supplierFilter}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>
            导出报表
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">按批次:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="全部">全部批次</option>
              {uniqueBatchNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">按供应商:</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="全部">全部供应商</option>
              {uniqueSuppliers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          {(batchFilter !== '全部' || supplierFilter !== '全部') && (
            <button
              onClick={() => {
                setBatchFilter('全部');
                setSupplierFilter('全部');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              清除筛选
            </button>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            共 {filteredSettlements.length} 条结算记录
          </span>
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
              <p className="text-sm text-gray-600">总补货</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalReplenishment.toLocaleString()}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSettlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {settlement.supplierName}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        ¥{settlement.totalAmount.toLocaleString()}
                      </td>
                      {editingId === settlement.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.deductions}
                              onChange={(e) => setEditForm({ ...editForm, deductions: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.replenishment}
                              onChange={(e) => setEditForm({ ...editForm, replenishment: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            ¥{(settlement.totalAmount - editForm.deductions + editForm.replenishment).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="待付款">待付款</option>
                              <option value="已付款">已付款</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSave(settlement.id)}
                                className="p-1 hover:bg-emerald-50 rounded"
                                title="保存"
                              >
                                <Save className="w-4 h-4 text-emerald-600" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="取消"
                              >
                                <span className="text-gray-600">×</span>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
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
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEdit(settlement)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSettlements.length === 0 && (
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无符合条件的结算数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                供应商排名
              </h2>
              <Badge variant={batchFilter !== '全部' || supplierFilter !== '全部' ? 'warning' : 'info'} size="sm">
                {batchFilter !== '全部' || supplierFilter !== '全部' ? '已筛选' : '按结算表现'}
              </Badge>
            </div>

            <div className="space-y-4">
              {filteredSupplierData.length > 0 ? (
                filteredSupplierData.map((supplier, index) => supplier && (
                  <div key={supplier.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
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
                          {supplier.performanceScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">综合评分</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">信用分:</span>
                        <span className="font-medium">{supplier.creditScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">付款率:</span>
                        <span className={`font-medium ${supplier.paymentRate >= 80 ? 'text-emerald-600' : supplier.paymentRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {supplier.paymentRate.toFixed(0)}%
                        </span>
                      </div>
                      {supplier.totalDeduction > 0 && (
                        <div className="flex justify-between text-red-600 col-span-2">
                          <span>累计扣款:</span>
                          <span>-¥{supplier.totalDeduction.toLocaleString()}</span>
                        </div>
                      )}
                      {supplier.unpaidCount > 0 && (
                        <div className="flex justify-between text-orange-600 col-span-2">
                          <span>待付款:</span>
                          <span>¥{supplier.finalAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {supplier.paidCount > 0 && (
                        <div className="flex justify-between text-emerald-600 col-span-2">
                          <span>已付款:</span>
                          <span>¥{supplier.finalAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无符合条件的供应商</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              核心指标
              <Badge variant="info" size="sm">
                筛选后
              </Badge>
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
