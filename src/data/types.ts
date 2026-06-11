export interface ProcurementBatch {
  id: string;
  batchNumber: string;
  name: string;
  type: '紫皮' | '白皮';
  grade: '特级' | '一级' | '二级';
  quantity: number;
  unitPrice: number;
  budgetTotal: number;
  deliveryDate: string;
  deliveryLocation: string;
  qualityStandard: string;
  status: '草稿' | '招标中' | '竞价中' | '已截止' | '已完成';
  invitedSuppliers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
  qualifications: {
    businessLicense: string;
    foodLicense: string;
    originCertificate: boolean;
    qualityCertificate: boolean;
  };
  creditScore: number;
  status: '待审核' | '已通过' | '已拒绝' | '黑名单';
  registeredAt: string;
}

export interface Quotation {
  id: string;
  batchId: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  freight: number;
  totalPrice: number;
  minOrder: number;
  validUntil: string;
  round: number;
  submittedAt: string;
}

export interface Sample {
  id: string;
  batchId: string;
  supplierId: string;
  supplierName: string;
  trackingNumber: string;
  appearanceScore: number;
  specScore: number;
  qualityScore: number;
  tasteScore: number;
  totalScore: number;
  status: '待验收' | '已验收';
  receivedAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  batchId: string;
  batchName: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  deliveryDate: string;
  paymentTerms: string;
  status: '待确认' | '已签署' | '执行中' | '已完成';
  createdAt: string;
  signedAt: string;
}

export interface QualityCheck {
  id: string;
  appearanceScore: number;
  specScore: number;
  qualityScore: number;
  tasteScore: number;
  totalScore: number;
  passed: boolean;
  notes: string;
  checkedAt: string;
}

export interface Issue {
  id: string;
  type: '破损' | '延迟' | '质量不符';
  description: string;
  amount: number;
  status: '待处理' | '已处理';
  createdAt: string;
}

export interface Order {
  id: string;
  contractId: string;
  supplierName: string;
  quantity: number;
  actualDeliveryDate: string;
  logisticsNumber: string;
  status: '待发货' | '运输中' | '已到货' | '质检中';
  qualityCheck?: QualityCheck;
  issues: Issue[];
}

export interface Settlement {
  id: string;
  contractId: string;
  orderId: string;
  supplierName: string;
  totalAmount: number;
  deductions: number;
  replenishment: number;
  finalAmount: number;
  status: '待付款' | '已付款';
  paidAt: string;
}
