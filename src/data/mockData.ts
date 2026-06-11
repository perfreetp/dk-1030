import { ProcurementBatch, Supplier, Quotation, Sample, Contract, Order, Settlement } from './types';

export const mockBatches: ProcurementBatch[] = [
  {
    id: 'batch-001',
    batchNumber: 'PO-2024-001',
    name: '2024年春季大蒜采购',
    type: '紫皮',
    grade: '一级',
    quantity: 50,
    unitPrice: 8000,
    budgetTotal: 400000,
    deliveryDate: '2024-05-01',
    deliveryLocation: '上海市浦东新区',
    qualityStandard: '直径≥5cm，无发芽，无腐烂',
    status: '竞价中',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15'
  },
  {
    id: 'batch-002',
    batchNumber: 'PO-2024-002',
    name: '餐饮连锁大蒜供应',
    type: '白皮',
    grade: '特级',
    quantity: 80,
    unitPrice: 9500,
    budgetTotal: 760000,
    deliveryDate: '2024-05-15',
    deliveryLocation: '北京市朝阳区',
    qualityStandard: '直径≥6cm，出口级品质',
    status: '招标中',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15'
  },
  {
    id: 'batch-003',
    batchNumber: 'PO-2024-003',
    name: '调味品厂大蒜原料',
    type: '紫皮',
    grade: '二级',
    quantity: 120,
    unitPrice: 6500,
    budgetTotal: 780000,
    deliveryDate: '2024-06-01',
    deliveryLocation: '广州市天河区',
    qualityStandard: '直径≥4cm，用于加工',
    status: '已完成',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-01'
  },
  {
    id: 'batch-004',
    batchNumber: 'PO-2024-004',
    name: '夏季大蒜储备',
    type: '白皮',
    grade: '一级',
    quantity: 60,
    unitPrice: 7500,
    budgetTotal: 450000,
    deliveryDate: '2024-06-15',
    deliveryLocation: '深圳市南山区',
    qualityStandard: '直径≥5cm，干燥度≥95%',
    status: '草稿',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    companyName: '山东金乡大蒜合作社',
    contactPerson: '张经理',
    phone: '138-0000-1234',
    location: '山东省济宁市金乡县',
    qualifications: {
      businessLicense: 'verified',
      foodLicense: 'verified',
      originCertificate: true,
      qualityCertificate: true
    },
    creditScore: 95,
    status: '已通过',
    registeredAt: '2024-01-15'
  },
  {
    id: 'sup-002',
    companyName: '河南杞县大蒜基地',
    contactPerson: '李总监',
    phone: '139-0000-5678',
    location: '河南省开封市杞县',
    qualifications: {
      businessLicense: 'verified',
      foodLicense: 'verified',
      originCertificate: true,
      qualityCertificate: false
    },
    creditScore: 88,
    status: '已通过',
    registeredAt: '2024-01-20'
  },
  {
    id: 'sup-003',
    companyName: '江苏邳州大蒜产业园',
    contactPerson: '王厂长',
    phone: '137-0000-9012',
    location: '江苏省徐州市邳州市',
    qualifications: {
      businessLicense: 'pending',
      foodLicense: 'verified',
      originCertificate: true,
      qualityCertificate: true
    },
    creditScore: 75,
    status: '待审核',
    registeredAt: '2024-03-10'
  },
  {
    id: 'sup-004',
    companyName: '云南大理大蒜种植园',
    contactPerson: '赵经理',
    phone: '136-0000-3456',
    location: '云南省大理白族自治州',
    qualifications: {
      businessLicense: 'verified',
      foodLicense: 'verified',
      originCertificate: true,
      qualityCertificate: true
    },
    creditScore: 92,
    status: '已通过',
    registeredAt: '2024-02-05'
  },
  {
    id: 'sup-005',
    companyName: '河北永年大蒜批发市场',
    contactPerson: '孙老板',
    phone: '135-0000-7890',
    location: '河北省邯郸市永年区',
    qualifications: {
      businessLicense: 'verified',
      foodLicense: 'pending',
      originCertificate: false,
      qualityCertificate: true
    },
    creditScore: 65,
    status: '待审核',
    registeredAt: '2024-03-12'
  }
];

export const mockQuotations: Quotation[] = [
  {
    id: 'quote-001',
    batchId: 'batch-001',
    supplierId: 'sup-001',
    supplierName: '山东金乡大蒜合作社',
    unitPrice: 7800,
    freight: 2000,
    totalPrice: 392000,
    minOrder: 10,
    validUntil: '2024-04-01',
    round: 1,
    submittedAt: '2024-03-15 10:30'
  },
  {
    id: 'quote-002',
    batchId: 'batch-001',
    supplierId: 'sup-002',
    supplierName: '河南杞县大蒜基地',
    unitPrice: 7600,
    freight: 2200,
    totalPrice: 382000,
    minOrder: 15,
    validUntil: '2024-04-01',
    round: 1,
    submittedAt: '2024-03-15 11:15'
  },
  {
    id: 'quote-003',
    batchId: 'batch-001',
    supplierId: 'sup-004',
    supplierName: '云南大理大蒜种植园',
    unitPrice: 8200,
    freight: 3000,
    totalPrice: 413000,
    minOrder: 20,
    validUntil: '2024-04-01',
    round: 1,
    submittedAt: '2024-03-15 14:20'
  },
  {
    id: 'quote-004',
    batchId: 'batch-002',
    supplierId: 'sup-001',
    supplierName: '山东金乡大蒜合作社',
    unitPrice: 9200,
    freight: 2500,
    totalPrice: 741500,
    minOrder: 20,
    validUntil: '2024-04-10',
    round: 1,
    submittedAt: '2024-03-14 09:00'
  }
];

export const mockSamples: Sample[] = [
  {
    id: 'sample-001',
    batchId: 'batch-001',
    supplierId: 'sup-001',
    supplierName: '山东金乡大蒜合作社',
    trackingNumber: 'SF1234567890',
    appearanceScore: 92,
    specScore: 88,
    qualityScore: 95,
    tasteScore: 90,
    totalScore: 91.25,
    status: '已验收',
    receivedAt: '2024-03-10'
  },
  {
    id: 'sample-002',
    batchId: 'batch-001',
    supplierId: 'sup-002',
    supplierName: '河南杞县大蒜基地',
    trackingNumber: 'YT9876543210',
    appearanceScore: 85,
    specScore: 90,
    qualityScore: 88,
    tasteScore: 92,
    totalScore: 88.75,
    status: '已验收',
    receivedAt: '2024-03-11'
  },
  {
    id: 'sample-003',
    batchId: 'batch-001',
    supplierId: 'sup-004',
    supplierName: '云南大理大蒜种植园',
    trackingNumber: 'ZTO555666777',
    appearanceScore: 88,
    specScore: 85,
    qualityScore: 92,
    tasteScore: 88,
    totalScore: 88.25,
    status: '待验收',
    receivedAt: '2024-03-12'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'contract-001',
    contractNumber: 'CT-2024-001',
    batchId: 'batch-003',
    batchName: '调味品厂大蒜原料',
    supplierId: 'sup-001',
    supplierName: '山东金乡大蒜合作社',
    totalAmount: 780000,
    deliveryDate: '2024-06-01',
    paymentTerms: '货到付款',
    status: '已完成',
    createdAt: '2024-02-25',
    signedAt: '2024-02-28'
  },
  {
    id: 'contract-002',
    contractNumber: 'CT-2024-002',
    batchId: 'batch-001',
    batchName: '2024年春季大蒜采购',
    supplierId: 'sup-002',
    supplierName: '河南杞县大蒜基地',
    totalAmount: 382000,
    deliveryDate: '2024-05-01',
    paymentTerms: '预付30%，到货付70%',
    status: '执行中',
    createdAt: '2024-03-16',
    signedAt: '2024-03-18'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    contractId: 'contract-001',
    supplierName: '山东金乡大蒜合作社',
    quantity: 120,
    actualDeliveryDate: '2024-03-01',
    logisticsNumber: 'JS123456789',
    status: '已到货',
    issues: []
  },
  {
    id: 'order-002',
    contractId: 'contract-002',
    supplierName: '河南杞县大蒜基地',
    quantity: 50,
    actualDeliveryDate: '2024-05-01',
    logisticsNumber: 'SF987654321',
    status: '运输中',
    issues: []
  }
];

export const mockSettlements: Settlement[] = [
  {
    id: 'settle-001',
    contractId: 'contract-001',
    orderId: 'order-001',
    supplierName: '山东金乡大蒜合作社',
    totalAmount: 780000,
    deductions: 5000,
    replenishment: 0,
    finalAmount: 775000,
    status: '已付款',
    paidAt: '2024-03-05'
  },
  {
    id: 'settle-002',
    contractId: 'contract-002',
    orderId: 'order-002',
    supplierName: '河南杞县大蒜基地',
    totalAmount: 382000,
    deductions: 0,
    replenishment: 0,
    finalAmount: 382000,
    status: '待付款',
    paidAt: ''
  }
];

export const statisticsData = {
  totalBatches: 4,
  activeSuppliers: 3,
  totalContracts: 2,
  totalOrders: 2,
  savingsRate: 8.5,
  onTimeRate: 95,
  qualityRate: 98,
  totalSavings: 156000
};
