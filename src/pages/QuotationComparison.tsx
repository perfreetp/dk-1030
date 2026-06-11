import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingDown, Trophy, Clock, DollarSign, Plus, CheckCircle, MousePointer } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Quotation } from '../data/types';

export default function QuotationComparison() {
  const navigate = useNavigate();
  const { batches, suppliers, quotations, addQuotation, addContract, updateBatch } = useStore();
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [roundFilter, setRoundFilter] = useState<number | 'all'>('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    supplierId: '',
    unitPrice: 0,
    freight: 0
  });

  const activeBatches = batches.filter(
    (b) => b.status === '竞价中' || b.status === '招标中'
  );

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const batchQuantity = selectedBatch?.quantity || 0;

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
  const currentRound = batchQuotations.length > 0 
    ? Math.max(...batchQuotations.map(q => q.round)) 
    : 0;

  const invitedSupplierIds = selectedBatchId 
    ? batches.find(b => b.id === selectedBatchId)?.invitedSuppliers || []
    : [];
  const invitedSuppliers = suppliers.filter(s => invitedSupplierIds.includes(s.id));

  const selectedQuote = quotations.find(q => q.id === selectedQuoteId);

  const handleStartNewRound = () => {
    if (!selectedBatchId) {
      alert('请先选择一个招标批次');
      return;
    }
    setQuoteForm({ supplierId: '', unitPrice: 0, freight: 0 });
    setShowQuoteModal(true);
  };

  const handleAddQuote = () => {
    if (!quoteForm.supplierId || !quoteForm.unitPrice) {
      alert('请填写完整的报价信息');
      return;
    }

    const supplier = suppliers.find(s => s.id === quoteForm.supplierId);
    if (!supplier) return;

    const newQuotation: Quotation = {
      id: `quote-${Date.now()}`,
      batchId: selectedBatchId,
      supplierId: quoteForm.supplierId,
      supplierName: supplier.companyName,
      unitPrice: quoteForm.unitPrice,
      freight: quoteForm.freight,
      totalPrice: quoteForm.unitPrice * batchQuantity + quoteForm.freight,
      minOrder: 10,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      round: currentRound + 1,
      submittedAt: new Date().toLocaleString('zh-CN')
    };

    addQuotation(newQuotation);
    updateBatch(selectedBatchId, { status: '竞价中' });
    setShowQuoteModal(false);
  };

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
  };

  const handleConfirmWinner = () => {
    setShowConfirmModal(true);
  };

  const handleGenerateContract = () => {
    if (!selectedQuoteId) {
      alert('请先在报价列表中选择一家供应商');
      return;
    }

    const quote = quotations.find(q => q.id === selectedQuoteId);
    if (!quote) return;

    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch) return;

    const newContract = {
      id: `contract-${Date.now()}`,
      contractNumber: `CT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      batchId: selectedBatchId,
      batchName: batch.name,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      totalAmount: quote.totalPrice,
      deliveryDate: batch.deliveryDate,
      paymentTerms: '预付30%，到货付70%',
      status: '待确认' as const,
      createdAt: new Date().toISOString().split('T')[0],
      signedAt: ''
    };

    addContract(newContract);
    updateBatch(selectedBatchId, { status: '已截止' });
    
    setShowConfirmModal(false);
    setSelectedQuoteId(null);
    alert(`已为 ${quote.supplierName} 生成待确认合同！\n合同金额: ¥${quote.totalPrice.toLocaleString()}\n交付日期: ${batch.deliveryDate}`);
    navigate('/contract');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报价比价</h1>
          <p className="text-gray-600 mt-1">
            多轮竞价，含税含运价格自动汇总 
            {selectedBatch && <span className="text-emerald-600">（当前批次数量: {batchQuantity}吨）</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">
            当前轮次: 第{currentRound + 1}轮
          </Badge>
          <Button icon={Plus} onClick={handleStartNewRound}>
            新增报价
          </Button>
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
                  onClick={() => {
                    setSelectedBatchId(batch.id);
                    setSelectedQuoteId(null);
                  }}
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
                    {batch.batchNumber} · {batch.quantity}吨
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
                    第 {round} 轮报价 ({batchQuotations.filter(q => q.round === round).length}条)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedBatchId ? (
            <div className="space-y-6">
              {selectedQuote && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <MousePointer className="w-8 h-8" />
                    <div>
                      <p className="text-blue-100">已选中供应商</p>
                      <p className="text-2xl font-bold">
                        {selectedQuote.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">含税单价</p>
                      <p className="text-xl font-bold">
                        ¥{selectedQuote.unitPrice.toLocaleString()}/吨
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">运费</p>
                      <p className="text-xl font-bold">
                        ¥{selectedQuote.freight.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">含税含运总价({batchQuantity}吨)</p>
                      <p className="text-xl font-bold">
                        ¥{selectedQuote.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {lowestPrice && !selectedQuote && (
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
                      <p className="text-emerald-100 text-sm">含税含运总价({batchQuantity}吨)</p>
                      <p className="text-xl font-bold">
                        ¥{lowestPrice.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <MousePointer className="w-4 h-4" />
                    点击选择一家供应商作为中标方（可不选最低价）
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          选择
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          排名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          供应商
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          含税单价
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          运费
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          含税含运总价({batchQuantity}吨)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          轮次
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedQuotations.map((quote, index) => (
                        <tr
                          key={quote.id}
                          className={`hover:bg-gray-50 cursor-pointer transition-all ${
                            selectedQuoteId === quote.id 
                              ? 'bg-blue-50 border-l-4 border-blue-500' 
                              : index === 0 && !selectedQuoteId
                              ? 'bg-emerald-50 border-l-4 border-emerald-500'
                              : ''
                          }`}
                          onClick={() => handleSelectQuote(quote.id)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              checked={selectedQuoteId === quote.id}
                              onChange={() => handleSelectQuote(quote.id)}
                              className="w-4 h-4 text-emerald-600"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {index === 0 && !selectedQuoteId && (
                                <Trophy className="w-5 h-5 text-emerald-600" />
                              )}
                              {selectedQuoteId === quote.id && (
                                <MousePointer className="w-5 h-5 text-blue-600" />
                              )}
                              <span
                                className={`font-bold ${
                                  selectedQuoteId === quote.id
                                    ? 'text-blue-600'
                                    : index === 0 && !selectedQuoteId
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
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {sortedQuotations.length === 0 && (
                    <div className="text-center py-12">
                      <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">暂无报价数据</p>
                      <Button className="mt-4" onClick={handleStartNewRound}>
                        添加第一轮报价
                      </Button>
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
                    <Button icon={CheckCircle} onClick={handleConfirmWinner} disabled={!selectedQuoteId}>
                      确认中标方
                    </Button>
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

      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              新增第{currentRound + 1}轮报价
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择供应商
                </label>
                <select
                  value={quoteForm.supplierId}
                  onChange={(e) => setQuoteForm({ ...quoteForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">请选择供应商</option>
                  {invitedSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  含税单价（元/吨）
                </label>
                <input
                  type="number"
                  value={quoteForm.unitPrice || ''}
                  onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：7500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  运费（元）
                </label>
                <input
                  type="number"
                  value={quoteForm.freight || ''}
                  onChange={(e) => setQuoteForm({ ...quoteForm, freight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例如：2000"
                />
              </div>

              {quoteForm.unitPrice > 0 && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">含税含运总价（{batchQuantity}吨）:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ¥{(quoteForm.unitPrice * batchQuantity + quoteForm.freight).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
                取消
              </Button>
              <Button onClick={handleAddQuote}>
                提交报价
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              确认中标方
            </h2>

            {selectedQuote ? (
              <>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MousePointer className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedQuote.supplierName}
                      </p>
                      <p className="text-sm text-gray-600">
                        第{selectedQuote.round}轮报价
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">含税单价:</span>
                      <span className="ml-2 font-medium">¥{selectedQuote.unitPrice}/吨</span>
                    </div>
                    <div>
                      <span className="text-gray-600">运费:</span>
                      <span className="ml-2 font-medium">¥{selectedQuote.freight}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">批次数量:</span>
                      <span className="ml-2 font-medium">{batchQuantity}吨</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">含税含运总价:</span>
                      <span className="ml-2 font-bold text-blue-600">
                        ¥{selectedQuote.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  确认后将为此供应商生成待确认合同，并结束本次竞价。
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">请先在报价列表中选择一家供应商</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                取消
              </Button>
              <Button onClick={handleGenerateContract} disabled={!selectedQuote}>
                确认并生成合同
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
