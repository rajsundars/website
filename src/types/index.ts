export interface Product {
  id: string;
  sku: string;
  name: string;
  variant: string; // Cabernet Sauvignon, Chardonnay, Pinot Noir, Champagne, etc.
  origin: string; // Bordeaux, Napa Valley, Marlborough, Champagne, etc.
  bottleSize: string; // 750ml, 1.5L, 375ml
  price: number;
  image: string; // placeholder image path
  category: "red" | "white" | "sparkling" | "rose";
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  contact: string;
  managerId: string;
  managerName: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  minThreshold: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  branchId: string;
  cashierName: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "cash" | "card" | "digital" | "split";
  date: string;
  status: "paid" | "refunded" | "cancelled";
  items: InvoiceItem[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  contact: string;
  branchId: string;
  role: "super_admin" | "branch_manager" | "cashier" | "inventory_staff" | "hr_staff" | "event_coordinator";
  status: "active" | "inactive" | "leave";
  salary: number;
  incentives: number;
  attendanceRate: number; // percentage, e.g. 96
}

export interface EventBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  eventType: "wedding" | "corporate" | "birthday" | "private_tasting";
  guestCount: number;
  budget: number;
  status: "enquiry" | "quoted" | "booked" | "completed" | "cancelled";
  notes?: string;
  inventoryReserved?: { productId: string; quantity: number }[];
  staffAssigned?: string[]; // employee ids
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  branchId?: string;
}
