export interface Customer {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  vatNumber: string | null;
  registrationNumber: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  orderCount: number;
}

export interface CreateCustomer {
  name: string;
  country?: string;
  city?: string;
  address?: string;
  vatNumber?: string;
  registrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export const OrderStatus = {
  New: 0,
  Confirmed: 1,
  InProduction: 2,
  Shipped: 3,
  Delivered: 4,
  Paid: 5,
  Cancelled: 6,
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.New]: 'New',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.InProduction]: 'In Production',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Paid]: 'Paid',
  [OrderStatus.Cancelled]: 'Cancelled',
};

export const ProductType = {
  MnO: 0,
  MnO2: 1,
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export interface OrderLine {
  id: string;
  productDescription: string;
  productType: ProductType;
  quantityTons: number;
  unitPriceUsd: number;
  totalPriceUsd: number;
  packagingType: string | null;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  orderDate: string;
  deliveryDate: string | null;
  destination: string;
  incoterms: string | null;
  paymentTerms: string | null;
  status: OrderStatus;
  customerId: string;
  customerName: string;
  lines: OrderLine[];
  totalAmountUsd: number;
  totalPaidUsd: number;
  createdAt: string;
}

export interface CreateOrder {
  invoiceNumber: string;
  orderDate: string;
  deliveryDate?: string;
  destination: string;
  incoterms?: string;
  paymentTerms?: string;
  customerId: string;
  lines: {
    productDescription: string;
    productType: ProductType;
    quantityTons: number;
    unitPriceUsd: number;
    packagingType?: string;
  }[];
}
