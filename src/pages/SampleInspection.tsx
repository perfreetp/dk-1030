import { useState } from 'react';
import { FlaskConical, Package, Star, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function SampleInspection() {
  const { samples, updateSample } = useStore();
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [scores, setScores] = useState({
    appearanceScore: 0,
    specScore: 0,
    qualityScore: 0,
    tasteScore: 0
  });

  const pendingSamples = samples.filter((s) => s.status === '待验收');
  const inspectedSamples = samples.filter((s) => s.status === '已验收');

  const handleScoreChange = (field: string, value: number) => {
    setScores({ ...scores, [field]: value });
  };

  const handleSubmitScore = (sampleId: string) => {
    const totalScore =
      (scores.appearanceScore +
        scores.specScore +
        scores.qualityScore +
        scores.tasteScore) /
      4;

    updateSample(sampleId, {
      ...scores,
      totalScore,
      status: '已验收'
    });

    setShowScoreForm(false);
    setSelectedSample(null);
    setScores({
      appearanceScore: 0,
      specScore: 0,
      qualityScore: 0,
      tasteScore: 0
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    return '不合格';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">样品验收</h1>
          <p className="text-gray-600 mt-1">样品评分与质量评估</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">
            {pendingSamples.length} 待验收
          </Badge>
          <Badge variant="success">
            {inspectedSamples.length} 已验收
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              待验收样品
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSamples.map((sample) => (
                <div
                  key={sample.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedSample === sample.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedSample(sample.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {sample.supplierName}
                      </p>
                      <p className="text-sm text-gray-500">
                        快递单号: {sample.trackingNumber}
                      </p>
                    </div>
                    <Badge variant="warning">待验收</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>送达时间: {sample.receivedAt}</span>
                  </div>

                  {selectedSample === sample.id && (
                    <Button
                      className="w-full mt-3"
                      onClick={() => setShowScoreForm(true)}
                    >
                      开始评分
                    </Button>
                  )}
                </div>
              ))}

              {pendingSamples.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-gray-500">暂无待验收样品</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-600" />
              已验收样品
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      供应商
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      外观
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      规格
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      品质
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      口感
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      综合
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inspectedSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sample.supplierName}
                      </td>
                      <td className={`px-4 py-3 ${getScoreColor(sample.appearanceScore)}`}>
                        {sample.appearanceScore}
                      </td>
                      <td className={`px-4 py-3 ${getScoreColor(sample.specScore)}`}>
                        {sample.specScore}
                      </td>
                      <td className={`px-4 py-3 ${getScoreColor(sample.qualityScore)}`}>
                        {sample.qualityScore}
                      </td>
                      <td className={`px-4 py-3 ${getScoreColor(sample.tasteScore)}`}>
                        {sample.tasteScore}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(sample.totalScore)}`}>
                            {sample.totalScore.toFixed(1)}
                          </span>
                          <Badge
                            variant={
                              sample.totalScore >= 90
                                ? 'success'
                                : sample.totalScore >= 80
                                ? 'info'
                                : sample.totalScore >= 70
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {getScoreLabel(sample.totalScore)}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inspectedSamples.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无已验收样品</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">评分标准</h3>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">外观评分</h4>
                </div>
                <p className="text-sm text-gray-600">
                  色泽、饱满度、均匀度
                </p>
                <p className="text-xs text-gray-500 mt-1">权重: 25%</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">规格评分</h4>
                </div>
                <p className="text-sm text-gray-600">大小、整齐度</p>
                <p className="text-xs text-gray-500 mt-1">权重: 25%</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-medium text-gray-900">品质评分</h4>
                </div>
                <p className="text-sm text-gray-600">水分、干物质含量</p>
                <p className="text-xs text-gray-500 mt-1">权重: 25%</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-gray-900">口感评分</h4>
                </div>
                <p className="text-sm text-gray-600">辛辣度、香味</p>
                <p className="text-xs text-gray-500 mt-1">权重: 25%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScoreForm && selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">样品评分</h2>

            <div className="space-y-6">
              {[
                { key: 'appearanceScore', label: '外观评分', color: 'purple' },
                { key: 'specScore', label: '规格评分', color: 'blue' },
                { key: 'qualityScore', label: '品质评分', color: 'emerald' },
                { key: 'tasteScore', label: '口感评分', color: 'orange' }
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label} (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores[item.key as keyof typeof scores]}
                    onChange={(e) =>
                      handleScoreChange(item.key, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">0</span>
                    <span
                      className={`text-lg font-bold text-${item.color}-600`}
                    >
                      {scores[item.key as keyof typeof scores]}
                    </span>
                    <span className="text-sm text-gray-500">100</span>
                  </div>
                </div>
              ))}

              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">综合评分</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {(
                      (scores.appearanceScore +
                        scores.specScore +
                        scores.qualityScore +
                        scores.tasteScore) /
                      4
                    ).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowScoreForm(false);
                  setSelectedSample(null);
                }}
              >
                取消
              </Button>
              <Button onClick={() => handleSubmitScore(selectedSample)}>
                确认评分
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
