import { useState } from 'react';
import { Search, TrendingDown, Trophy, Clock, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';

export default function QuotationComparison() {
  const { batches, quotations } = useStore();
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [roundFilter, setRoundFilter] = useState<number | 'all'>('all');

  const activeBatches = batches.filter(
    (b) => b.status === '竞价中' || b.status === '招标中'
  );

  const batchQuotations = selectedBatchId
    ? quotations.filter((q) => q.batchId === selectedBatchId)
    : [];

  const filteredQuotations =
    roundFilter === 'all'
      ? batchQuotations
      : batchQuotations.filter((q) => q.round === roundFilter);

  const sortedQuotations = [...filteredQuotations].sort(
    (a, b) => a.totalPrice - b.totalPrice
  );

  const lowestPrice = sortedQuotations.length > 0 ? sortedQuotations[0] : null;

  const handleStartNewRound = () => {
    alert('开始新一轮竞价');
  };

  const handleConfirmWinner = () => {
    if (lowestPrice) {
      alert(`确认 ${lowestPrice.supplierName} 为中标方`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报价比价</h1>
          <p className="text-gray-600 mt-1">多轮竞价，含税含运价格自动汇总</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">
            当前轮次: 第{selectedBatchId ? Math.max(...batchQuotations.map(q => q.round), 1) : 1}轮
          </Badge>
          <button
            onClick={handleStartNewRound}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            开始新轮次
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">选择招标批次</h3>
            <div className="space-y-2">
              {activeBatches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedBatchId === batch.id
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {batch.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {batch.batchNumber}
                  </p>
                </button>
              ))}

              {activeBatches.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  暂无进行中的招标
                </p>
              )}
            </div>
          </div>

          {selectedBatchId && (
            <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">竞价轮次</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setRoundFilter('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    roundFilter === 'all'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  全部轮次
                </button>
                {[1, 2, 3].map((round) => (
                  <button
                    key={round}
                    onClick={() => setRoundFilter(round)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      roundFilter === round
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    第 {round} 轮报价
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedBatchId ? (
            <div className="space-y-6">
              {lowestPrice && (
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-8 h-8" />
                    <div>
                      <p className="text-emerald-100">当前最低价</p>
                      <p className="text-2xl font-bold">
                        {lowestPrice.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-emerald-100 text-sm">含税单价</p>
                      <p className="text-xl font-bold">
                        ¥{lowestPrice.unitPrice.toLocaleString()}/吨
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">运费</p>
                      <p className="text-xl font-bold">
                        ¥{lowestPrice.freight.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">含税含运总价</p>
                      <p className="text-xl font-bold">
                        ¥{lowestPrice.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          排名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          供应商
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          含税单价
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          运费
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          含税含运总价
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          轮次
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最小起订量
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedQuotations.map((quote, index) => (
                        <tr
                          key={quote.id}
                          className={`hover:bg-gray-50 ${
                            index === 0 ? 'bg-emerald-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Trophy className="w-5 h-5 text-emerald-600" />
                              )}
                              <span
                                className={`font-bold ${
                                  index === 0
                                    ? 'text-emerald-600'
                                    : 'text-gray-900'
                                }`}
                              >
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {quote.supplierName}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">
                                ¥{quote.unitPrice.toLocaleString()}/吨
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            ¥{quote.freight.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-bold text-gray-900">
                              ¥{quote.totalPrice.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="info" size="sm">
                              第{quote.round}轮
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {quote.minOrder}吨
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {sortedQuotations.length === 0 && (
                    <div className="text-center py-12">
                      <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">暂无报价数据</p>
                    </div>
                  )}
                </div>
              </div>

              {sortedQuotations.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">价格分析</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <TrendingDown className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        ¥
                        {(
                          sortedQuotations.reduce(
                            (sum, q) => sum + q.unitPrice,
                            0
                          ) / sortedQuotations.length
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">平均单价</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        ¥
                        {Math.max(
                          ...sortedQuotations.map((q) => q.unitPrice)
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">最高单价</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-emerald-600">
                        ¥
                        {(
                          Math.max(
                            ...sortedQuotations.map((q) => q.unitPrice)
                          ) -
                          Math.min(...sortedQuotations.map((q) => q.unitPrice))
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">价差空间</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      导出比价报告
                    </button>
                    <button
                      onClick={handleConfirmWinner}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      确认中标方
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                选择招标批次
              </h3>
              <p className="text-gray-600">
                请在左侧选择一个招标批次以查看报价对比
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
