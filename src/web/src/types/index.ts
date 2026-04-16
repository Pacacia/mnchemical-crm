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

// HR types

export const WorkSchedule = {
  Day9to18: 0,
  Day9to21: 1,
  Night21to9: 2,
} as const;
export type WorkSchedule = (typeof WorkSchedule)[keyof typeof WorkSchedule];

export const WorkScheduleLabels: Record<WorkSchedule, string> = {
  [WorkSchedule.Day9to18]: '09:00 - 18:00',
  [WorkSchedule.Day9to21]: '09:00 - 21:00',
  [WorkSchedule.Night21to9]: '21:00 - 09:00',
};

export interface Employee {
  id: string;
  badgeId: string;
  fullName: string;
  department: string | null;
  position: string | null;
  shift: string | null;
  schedule: WorkSchedule;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEmployee {
  badgeId: string;
  fullName: string;
  department?: string;
  position?: string;
  shift?: string;
  schedule: WorkSchedule;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workTime: string | null;
  overtime: string | null;
  nightHours: string | null;
  isLateArrival: boolean;
  isAbsent: boolean;
  isMissingClockOut: boolean;
  isManualOverride: boolean;
  managerComment: string | null;
  employeeId: string;
  employeeName: string;
  department: string | null;
}

export interface TodayAttendanceSummary {
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  missingClockOutCount: number;
  records: AttendanceRecord[];
}

export interface MonthlyEmployeeSummary {
  employeeId: string;
  employeeName: string;
  department: string | null;
  daysWorked: number;
  lateCount: number;
  absentCount: number;
  totalWorkTime: string;
  totalOvertime: string;
  totalNightHours: string;
  missingClockOutCount: number;
}

export interface CsvImportResult {
  recordsImported: number;
  employeesCreated: number;
  duplicatesSkipped: number;
  warnings: string[];
}

export const LeaveType = {
  Vacation: 0,
  Sick: 1,
  Personal: 2,
} as const;
export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

export const LeaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.Vacation]: 'Vacation',
  [LeaveType.Sick]: 'Sick',
  [LeaveType.Personal]: 'Personal',
};

export const LeaveStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

export const LeaveStatusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.Pending]: 'Pending',
  [LeaveStatus.Approved]: 'Approved',
  [LeaveStatus.Rejected]: 'Rejected',
};

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  employeeId: string;
  employeeName: string;
  department: string | null;
  dayCount: number;
  createdAt: string;
}

// Shipment & Transport types

export interface Shipment {
  id: string;
  batchNumber: string;
  containerNumber: string;
  netWeightKg: number;
  grossWeightKg: number;
  bigBagCount: number;
  smallBagCount: number;
  palletCount: number;
  shipmentDate: string | null;
  departureDate: string | null;
  orderId: string;
  orderInvoiceNumber: string;
  customerName: string;
  destination: string;
  hasTransportInvoice: boolean;
  totalTransportCostUsd: number;
}

export interface CreateShipment {
  batchNumber: string;
  containerNumber: string;
  netWeightKg: number;
  grossWeightKg: number;
  bigBagCount: number;
  smallBagCount: number;
  palletCount: number;
  shipmentDate?: string;
  departureDate?: string;
  orderId: string;
}

export interface TransportRecord {
  id: string;
  carrierInvoiceNumber: string;
  invoiceDate: string;
  carrierName: string;
  routeLeg: string;
  costUsd: number;
  costGel: number;
  exchangeRate: number;
  vatRate: number;
  vatAmountUsd: number;
  totalWithVatUsd: number;
  shipmentId: string;
  containerNumber: string | null;
  orderInvoiceNumber: string | null;
  createdAt: string;
}

export interface CreateTransportRecord {
  carrierInvoiceNumber: string;
  invoiceDate: string;
  carrierName: string;
  routeLeg: string;
  costUsd: number;
  costGel: number;
  exchangeRate: number;
  vatRate: number;
  shipmentId: string;
}
