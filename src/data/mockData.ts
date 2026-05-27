import { Product, Branch, InventoryItem, Invoice, Employee, EventBooking, ActivityLog } from "../types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    sku: "WN-CAB-MARG-18",
    name: "Château Margaux 2018",
    variant: "Cabernet Sauvignon Blend",
    origin: "Bordeaux, France",
    bottleSize: "750ml",
    price: 1250,
    category: "red",
    description: "A legendary Premier Grand Cru Classé from Bordeaux. Extremely refined, displaying complex layers of cassis, black violets, and sweet cedar wood. Excellent aging potential.",
    image: "/images/wines/margaux.png"
  },
  {
    id: "p2",
    sku: "WN-CAB-PENF-389",
    name: "Penfolds Bin 389 2021",
    variant: "Cabernet Shiraz Blend",
    origin: "Barossa Valley, Australia",
    bottleSize: "750ml",
    price: 145,
    category: "red",
    description: "Often referred to as 'Baby Grange'. This bold red wine combines the structure of Cabernet Sauvignon with the richness of Shiraz. Shows dark fruits, toasted oak, and savory spices.",
    image: "/images/wines/penfolds.png"
  },
  {
    id: "p3",
    sku: "WN-PIN-TIGN-20",
    name: "Tignanello Toscana 2020",
    variant: "Sangiovese Blend",
    origin: "Tuscany, Italy",
    bottleSize: "750ml",
    price: 240,
    category: "red",
    description: "An iconic Super Tuscan offering. Rich and silky, exhibiting black cherry, dark chocolate, rosemary notes, and fine-grained tannins. Ideal with roasted game or truffle dishes.",
    image: "/images/wines/tignanello.png"
  },
  {
    id: "p4",
    sku: "WN-CHA-CLDY-22",
    name: "Cloudy Bay Sauvignon Blanc 2022",
    variant: "Sauvignon Blanc",
    origin: "Marlborough, New Zealand",
    bottleSize: "750ml",
    price: 68,
    category: "white",
    description: "World-famous New Zealand white. Vibrant and fresh, bursting with passionfruit, lime, kaffir lime leaf, and crisp mineral acidity. Matches fresh seafood beautifully.",
    image: "/images/wines/cloudybay.png"
  },
  {
    id: "p5",
    sku: "WN-CHA-CHAB-21",
    name: "Louis Jadot Chablis 2021",
    variant: "Chardonnay",
    origin: "Burgundy, France",
    bottleSize: "750ml",
    price: 78,
    category: "white",
    description: "Classic dry white Burgundy. Stainless steel fermentation preserves pure green apple, flinty minerality, and clean citrus notes. Clean and refreshing.",
    image: "/images/wines/chablis.png"
  },
  {
    id: "p6",
    sku: "WN-SPK-DOMP-12",
    name: "Dom Pérignon Brut 2012",
    variant: "Champagne Blend",
    origin: "Champagne, France",
    bottleSize: "750ml",
    price: 360,
    category: "sparkling",
    description: "A masterpiece of balance and elegance. Opens with aromas of white flowers and stone fruit, followed by toasted brioche, ginger, and saline minerality on a creamy finish.",
    image: "/images/wines/domperignon.png"
  },
  {
    id: "p7",
    sku: "WN-SPK-MOET-NV",
    name: "Moët & Chandon Impérial NV",
    variant: "Champagne Blend",
    origin: "Champagne, France",
    bottleSize: "750ml",
    price: 95,
    category: "sparkling",
    description: "The house's signature Champagne since 1869. Balanced and vibrant, combining green apple, citrus, brioche, and white flowers with fine, persistent bubbles.",
    image: "/images/wines/moet.png"
  },
  {
    id: "p8",
    sku: "WN-ROS-WHSP-22",
    name: "Whispering Angel Rosé 2022",
    variant: "Grenache Cinsault Blend",
    origin: "Provence, France",
    bottleSize: "750ml",
    price: 58,
    category: "rose",
    description: "The world's most popular luxury rosé. Delicate and pale pink, offering raspberry, strawberry, and fresh peach notes with a dry, mineral, and incredibly smooth finish.",
    image: "/images/wines/whisperingangel.png"
  }
];

export const mockBranches: Branch[] = [
  {
    id: "b1",
    name: "KSL City Cellar",
    location: "03-12 KSL City Mall, Jalan Seladang, Taman Abad, 80250 Johor Bahru, Johor, Malaysia",
    contact: "+60 7 330 8920",
    managerId: "emp2",
    managerName: "Darren Tan"
  },
  {
    id: "b2",
    name: "Mid Valley Cellar",
    location: "Level 1-40, Mid Valley Southkey, Jalan Pantai Senibong, 80150 Johor Bahru, Johor, Malaysia",
    contact: "+60 7 288 1240",
    managerId: "emp3",
    managerName: "Audrey Lim"
  },
  {
    id: "b3",
    name: "Puteri Harbour Cellar",
    location: "Lot G-15, Puteri Harbour Marina, Persiaran Puteri Selatan, 79000 Iskandar Puteri, Johor, Malaysia",
    contact: "+60 7 570 4110",
    managerId: "emp4",
    managerName: "Marcus Wee"
  }
];

export const mockInventory: InventoryItem[] = [
  // KSL City Cellar (b1)
  { id: "i1", productId: "p1", branchId: "b1", quantity: 15, minThreshold: 5 },
  { id: "i2", productId: "p2", branchId: "b1", quantity: 48, minThreshold: 10 },
  { id: "i3", productId: "p3", branchId: "b1", quantity: 24, minThreshold: 8 },
  { id: "i4", productId: "p4", branchId: "b1", quantity: 60, minThreshold: 12 },
  { id: "i5", productId: "p5", branchId: "b1", quantity: 36, minThreshold: 10 },
  { id: "i6", productId: "p6", branchId: "b1", quantity: 2, minThreshold: 5 }, // Low stock alert!
  { id: "i7", productId: "p7", branchId: "b1", quantity: 80, minThreshold: 15 },
  { id: "i8", productId: "p8", branchId: "b1", quantity: 50, minThreshold: 12 },

  // Mid Valley Cellar (b2)
  { id: "i9", productId: "p1", branchId: "b2", quantity: 8, minThreshold: 5 },
  { id: "i10", productId: "p2", branchId: "b2", quantity: 5, minThreshold: 10 }, // Low stock alert!
  { id: "i11", productId: "p3", branchId: "b2", quantity: 18, minThreshold: 8 },
  { id: "i12", productId: "p4", branchId: "b2", quantity: 42, minThreshold: 12 },
  { id: "i13", productId: "p5", branchId: "b2", quantity: 20, minThreshold: 10 },
  { id: "i14", productId: "p6", branchId: "b2", quantity: 12, minThreshold: 5 },
  { id: "i15", productId: "p7", branchId: "b2", quantity: 55, minThreshold: 15 },
  { id: "i16", productId: "p8", branchId: "b2", quantity: 35, minThreshold: 12 },

  // Puteri Harbour Cellar (b3)
  { id: "i17", productId: "p1", branchId: "b3", quantity: 12, minThreshold: 5 },
  { id: "i18", productId: "p2", branchId: "b3", quantity: 30, minThreshold: 10 },
  { id: "i19", productId: "p3", branchId: "b3", quantity: 10, minThreshold: 8 },
  { id: "i20", productId: "p4", branchId: "b3", quantity: 24, minThreshold: 12 },
  { id: "i21", productId: "p5", branchId: "b3", quantity: 15, minThreshold: 10 },
  { id: "i22", productId: "p6", branchId: "b3", quantity: 6, minThreshold: 5 },
  { id: "i23", productId: "p7", branchId: "b3", quantity: 40, minThreshold: 15 },
  { id: "i24", productId: "p8", branchId: "b3", quantity: 28, minThreshold: 12 }
];

export const mockEmployees: Employee[] = [
  {
    id: "emp1",
    name: "Guna S.",
    email: "guna.s@gunawines.my",
    contact: "+60 11-1234 5678",
    branchId: "b1", // base location
    role: "super_admin",
    status: "active",
    salary: 12000,
    incentives: 0,
    attendanceRate: 100
  },
  {
    id: "emp2",
    name: "Darren Tan",
    email: "darren.tan@gunawines.my",
    contact: "+60 12-345 6789",
    branchId: "b1",
    role: "branch_manager",
    status: "active",
    salary: 5500,
    incentives: 450,
    attendanceRate: 98
  },
  {
    id: "emp3",
    name: "Audrey Lim",
    email: "audrey.lim@gunawines.my",
    contact: "+60 13-456 7890",
    branchId: "b2",
    role: "branch_manager",
    status: "active",
    salary: 5700,
    incentives: 600,
    attendanceRate: 97
  },
  {
    id: "emp4",
    name: "Marcus Wee",
    email: "marcus.wee@gunawines.my",
    contact: "+60 14-567 8901",
    branchId: "b3",
    role: "branch_manager",
    status: "active",
    salary: 5400,
    incentives: 300,
    attendanceRate: 96
  },
  {
    id: "emp5",
    name: "Timothy Lin",
    email: "timothy.lin@gunawines.my",
    contact: "+60 16-678 9012",
    branchId: "b1",
    role: "cashier",
    status: "active",
    salary: 2800,
    incentives: 150,
    attendanceRate: 95
  },
  {
    id: "emp6",
    name: "Sarah Khoo",
    email: "sarah.khoo@gunawines.my",
    contact: "+60 17-789 0123",
    branchId: "b2",
    role: "cashier",
    status: "active",
    salary: 2850,
    incentives: 200,
    attendanceRate: 99
  },
  {
    id: "emp7",
    name: "David Miller",
    email: "david.miller@gunawines.my",
    contact: "+60 18-890 1234",
    branchId: "b3",
    role: "inventory_staff",
    status: "active",
    salary: 3000,
    incentives: 100,
    attendanceRate: 94
  },
  {
    id: "emp8",
    name: "Jane Chen",
    email: "jane.chen@gunawines.my",
    contact: "+60 19-901 2345",
    branchId: "b1",
    role: "event_coordinator",
    status: "active",
    salary: 4500,
    incentives: 500,
    attendanceRate: 97
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2026-081",
    branchId: "b1",
    cashierName: "Timothy Lin",
    customerName: "Robert Parker",
    subtotal: 1395,
    taxAmount: 125.55,
    discountAmount: 145, // bin 389 promo discount
    totalAmount: 1375.55,
    paymentMethod: "card",
    date: "2026-05-27T03:20:00Z",
    status: "paid",
    items: [
      { productId: "p1", productName: "Château Margaux 2018", quantity: 1, unitPrice: 1250, totalPrice: 1250 },
      { productId: "p2", productName: "Penfolds Bin 389 2021", quantity: 1, unitPrice: 145, totalPrice: 145 }
    ]
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2026-082",
    branchId: "b2",
    cashierName: "Sarah Khoo",
    customerName: "Timothy Lin",
    subtotal: 2156,
    taxAmount: 194.04,
    discountAmount: 0,
    totalAmount: 2350.04,
    paymentMethod: "split",
    date: "2026-05-27T04:15:00Z",
    status: "paid",
    items: [
      { productId: "p6", productName: "Dom Pérignon Brut 2012", quantity: 5, unitPrice: 360, totalPrice: 1800 },
      { productId: "p7", productName: "Moët & Chandon Impérial NV", quantity: 3, unitPrice: 95, totalPrice: 285 },
      { productId: "p8", productName: "Whispering Angel Rosé 2022", quantity: 1, unitPrice: 58, totalPrice: 58 }
    ]
  },
  {
    id: "inv3",
    invoiceNumber: "INV-2026-083",
    branchId: "b3",
    cashierName: "Marcus Wee",
    customerName: "David Miller",
    subtotal: 516,
    taxAmount: 46.44,
    discountAmount: 22.24,
    totalAmount: 540.20,
    paymentMethod: "cash",
    date: "2026-05-26T09:40:00Z",
    status: "refunded",
    items: [
      { productId: "p3", productName: "Tignanello Toscana 2020", quantity: 2, unitPrice: 240, totalPrice: 480 },
      { productId: "p5", productName: "Louis Jadot Chablis 2021", quantity: 1, unitPrice: 78, totalPrice: 78 }
    ]
  },
  {
    id: "inv4",
    invoiceNumber: "INV-2026-079",
    branchId: "b1",
    cashierName: "Timothy Lin",
    customerName: "Walk-in Guest",
    subtotal: 136,
    taxAmount: 12.24,
    discountAmount: 10,
    totalAmount: 138.24,
    paymentMethod: "digital",
    date: "2026-05-25T11:05:00Z",
    status: "paid",
    items: [
      { productId: "p4", productName: "Cloudy Bay Sauvignon Blanc 2022", quantity: 2, unitPrice: 68, totalPrice: 136 }
    ]
  },
  {
    id: "inv5",
    invoiceNumber: "INV-2026-080",
    branchId: "b2",
    cashierName: "Sarah Khoo",
    customerName: "Corporate Guest",
    subtotal: 3600,
    taxAmount: 324,
    discountAmount: 360,
    totalAmount: 3564,
    paymentMethod: "card",
    date: "2026-05-25T14:30:00Z",
    status: "paid",
    items: [
      { productId: "p6", productName: "Dom Pérignon Brut 2012", quantity: 10, unitPrice: 360, totalPrice: 3600 }
    ]
  }
];

export const mockEvents: EventBooking[] = [
  {
    id: "ev1",
    customerName: "Maybank Corporate Event",
    customerEmail: "events@maybank.com.my",
    customerPhone: "+60 3-2070 8888",
    date: "2026-06-15",
    eventType: "corporate",
    guestCount: 60,
    budget: 8000,
    status: "booked",
    notes: "Requires premium red wines and champagne. Catering organized externally.",
    inventoryReserved: [
      { productId: "p1", quantity: 5 },
      { productId: "p6", quantity: 10 },
      { productId: "p4", quantity: 15 }
    ],
    staffAssigned: ["emp8", "emp5"]
  },
  {
    id: "ev2",
    customerName: "Lim's Wedding Tasting Dinner",
    customerEmail: "alvin.lim@gmail.com",
    customerPhone: "+60 12-765 4321",
    date: "2026-06-22",
    eventType: "wedding",
    guestCount: 120,
    budget: 15000,
    status: "quoted",
    notes: "Requires wedding custom bordeaux pairings. Initial quotation sent on May 24.",
    inventoryReserved: [
      { productId: "p1", quantity: 10 },
      { productId: "p7", quantity: 20 }
    ],
    staffAssigned: ["emp8"]
  },
  {
    id: "ev3",
    customerName: "Private Sommelier Masterclass",
    customerEmail: "tan.jessica@yahoo.com",
    customerPhone: "+60 19-876 5432",
    date: "2026-05-30",
    eventType: "private_tasting",
    guestCount: 12,
    budget: 2500,
    status: "enquiry",
    notes: "Birthday tasting session for a collector. Focused on French Grand Crus."
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "a1",
    userId: "emp1",
    userName: "Guna S.",
    action: "ROLE_UPDATE",
    details: "Assigned Sarah Khoo as Head Cashier at Mid Valley Cellar.",
    timestamp: "2026-05-27T04:50:00Z"
  },
  {
    id: "a2",
    userId: "emp5",
    userName: "Timothy Lin",
    action: "STOCK_TRANSFER",
    details: "Initiated transfer of 10 bottles of Moët & Chandon to KSL City Cellar.",
    timestamp: "2026-05-27T04:02:00Z",
    branchId: "b1"
  },
  {
    id: "a3",
    userId: "emp3",
    userName: "Audrey Lim",
    action: "BILLING_CLOSE",
    details: "Logged daily sales closing balance for Mid Valley Cellar.",
    timestamp: "2026-05-26T14:30:00Z",
    branchId: "b2"
  },
  {
    id: "a4",
    userId: "emp7",
    userName: "David Miller",
    action: "STOCK_ADJUSTMENT",
    details: "Logged 1 damaged bottle of Château Margaux (bottle breakage).",
    timestamp: "2026-05-26T08:15:00Z",
    branchId: "b3"
  }
];
