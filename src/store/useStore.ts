import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProcurementBatch,
  Supplier,
  Quotation,
  Sample,
  Contract,
  Order,
  Settlement
} from '../data/types';
import {
  mockBatches,
  mockSuppliers,
  mockQuotations,
  mockSamples,
  mockContracts,
  mockOrders,
  mockSettlements
} from '../data/mockData';

interface AppState {
  batches: ProcurementBatch[];
  suppliers: Supplier[];
  quotations: Quotation[];
  samples: Sample[];
  contracts: Contract[];
  orders: Order[];
  settlements: Settlement[];

  addBatch: (batch: ProcurementBatch) => void;
  updateBatch: (id: string, updates: Partial<ProcurementBatch>) => void;
  deleteBatch: (id: string) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;

  addSample: (sample: Sample) => void;
  updateSample: (id: string, updates: Partial<Sample>) => void;

  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;

  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;

  addSettlement: (settlement: Settlement) => void;
  updateSettlement: (id: string, updates: Partial<Settlement>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      batches: mockBatches,
      suppliers: mockSuppliers,
      quotations: mockQuotations,
      samples: mockSamples,
      contracts: mockContracts,
      orders: mockOrders,
      settlements: mockSettlements,

      addBatch: (batch) =>
        set((state) => ({ batches: [...state.batches, batch] })),

      updateBatch: (id, updates) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          )
        })),

      deleteBatch: (id) =>
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id)
        })),

      addSupplier: (supplier) =>
        set((state) => ({ suppliers: [...state.suppliers, supplier] })),

      updateSupplier: (id, updates) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        })),

      addQuotation: (quotation) =>
        set((state) => ({ quotations: [...state.quotations, quotation] })),

      updateQuotation: (id, updates) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          )
        })),

      addSample: (sample) =>
        set((state) => ({ samples: [...state.samples, sample] })),

      updateSample: (id, updates) =>
        set((state) => ({
          samples: state.samples.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        })),

      addContract: (contract) =>
        set((state) => ({ contracts: [...state.contracts, contract] })),

      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          )
        })),

      addOrder: (order) =>
        set((state) => ({ orders: [...state.orders, order] })),

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          )
        })),

      addSettlement: (settlement) =>
        set((state) => ({ settlements: [...state.settlements, settlement] })),

      updateSettlement: (id, updates) =>
        set((state) => ({
          settlements: state.settlements.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        }))
    }),
    {
      name: 'garlic-procurement-storage'
    }
  )
);
