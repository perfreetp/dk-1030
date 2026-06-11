import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Building2, Phone, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Supplier } from '../data/types';

export default function SupplierRegistration() {
  const { suppliers, updateSupplier } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '全部' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (supplierId: string) => {
    updateSupplier(supplierId, { status: '已通过' });
  };

  const handleReject = (supplierId: string) => {
    updateSupplier(supplierId, { status: '已拒绝' });
  };

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    待审核: 'warning',
    已通过: 'success',
    已拒绝: 'danger',
    黑名单: 'danger'
  };

  const getQualificationStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">供应商报名</h1>
          <p className="text-gray-600 mt-1">管理供应商资质审核与注册</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">
            {suppliers.filter((s) => s.status === '待审核').length} 待审核
          </Badge>
          <Badge variant="success">
            {suppliers.filter((s) => s.status === '已通过').length} 已通过
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索公司名称或联系人..."
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
              <option value="待审核">待审核</option>
              <option value="已通过">已通过</option>
              <option value="已拒绝">已拒绝</option>
              <option value="黑名单">黑名单</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      供应商信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      信用评分
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
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedSupplier?.id === supplier.id
                          ? 'bg-emerald-50'
                          : ''
                      }`}
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {supplier.companyName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {supplier.contactPerson}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${supplier.creditScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {supplier.creditScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusColors[supplier.status]}>
                          {supplier.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {supplier.status === '待审核' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(supplier.id);
                              }}
                              className="p-1 hover:bg-emerald-50 rounded"
                              title="通过"
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(supplier.id);
                              }}
                              className="p-1 hover:bg-red-50 rounded"
                              title="拒绝"
                            >
                              <XCircle className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">未找到符合条件的供应商</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">供应商详情</h3>

              {selectedSupplier ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">公司名称</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedSupplier.companyName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{selectedSupplier.phone}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{selectedSupplier.location}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      资质文件
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">营业执照</span>
                        {getQualificationStatus(
                          selectedSupplier.qualifications.businessLicense
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">食品经营许可证</span>
                        {getQualificationStatus(
                          selectedSupplier.qualifications.foodLicense
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">产地证明</span>
                        {selectedSupplier.qualifications.originCertificate ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">质量认证</span>
                        {selectedSupplier.qualifications.qualityCertificate ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      信用评分
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${selectedSupplier.creditScore}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {selectedSupplier.creditScore}
                      </span>
                    </div>
                  </div>

                  {selectedSupplier.status === '待审核' && (
                    <div className="pt-4 border-t border-gray-200 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(selectedSupplier.id)}
                      >
                        通过
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={() => handleReject(selectedSupplier.id)}
                      >
                        拒绝
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  点击左侧供应商查看详情
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
