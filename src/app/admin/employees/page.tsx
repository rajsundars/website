"use client";
import { API_BASE_URL } from "@/config";


import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  X, 
  Loader2, 
  DollarSign, 
  Trash2, 
  Edit, 
  Download
} from "lucide-react";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  contact: string;
  status: string;
  salary: number;
  incentives: number;
  attendanceRate: number;
  branchName: string;
}

interface ShiftRow {
  id: string;
  user_id: string;
  date: string;
  shift_type: string;
  userName: string;
  userRole: string;
}

interface PayrollRow {
  id: string;
  user_id: string;
  month: string;
  base_salary: number;
  incentives: number;
  deductions: number;
  net_salary: number;
  status: string;
  paid_date: string;
  userName: string;
  userRole: string;
  branchName: string;
}

export default function AdminEmployeesPage() {
  const { activeBranch, token, user } = useAdmin();

  const [activeTab, setActiveTab] = useState<"roster" | "shifts" | "payroll">("roster");

  const [roster, setRoster] = useState<EmployeeRow[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeRow | null>(null);

  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("cashier");
  const [empBranch, setEmpBranch] = useState("b1");
  const [empContact, setEmpContact] = useState("");
  const [empSalary, setEmpSalary] = useState("3000");
  const [empStatus, setEmpStatus] = useState("active");
  const [empIncentives, setEmpIncentives] = useState("0");
  const [crudSubmitting, setCrudSubmitting] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [shiftUpdatingId, setShiftUpdatingId] = useState<string | null>(null);

  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState("2026-05");
  const [payrollSubmitting, setPayrollSubmitting] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRoster = async () => {
    setRosterLoading(true);
    setRosterError(null);
    try {
      const url = activeBranch === "all"
        ? API_BASE_URL + "/api/employees"
        : `${API_BASE_URL}/api/employees?branchId=${activeBranch}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load roster.");
      const data = await res.json();
      setRoster(data);
    } catch (err: any) {
      setRosterError(err.message || "Error fetching staff roster.");
    } finally {
      setRosterLoading(false);
    }
  };

  const fetchShifts = async () => {
    setShiftsLoading(true);
    try {
      const res = await fetch(API_BASE_URL + "/api/employees/shifts");
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (err) {
      console.error("Error loading shifts calendar:", err);
    } finally {
      setShiftsLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setPayrollLoading(true);
    try {
      const res = await fetch(API_BASE_URL + "/api/employees/payroll");
      if (res.ok) {
        const data = await res.json();
        setPayroll(data);
      }
    } catch (err) {
      console.error("Error loading payroll history:", err);
    } finally {
      setPayrollLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    if (activeTab === "shifts") fetchShifts();
    if (activeTab === "payroll") fetchPayroll();
  }, [activeBranch, activeTab]);

  const handleOpenEdit = (emp: EmployeeRow) => {
    setEditingEmp(emp);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpRole(emp.role);
    setEmpBranch(emp.branchId || "b1");
    setEmpContact(emp.contact);
    setEmpSalary(String(emp.salary));
    setEmpStatus(emp.status);
    setEmpIncentives(String(emp.incentives || 0));
    setCrudError(null);
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudSubmitting(true);
    setCrudError(null);

    try {
      const res = await fetch(API_BASE_URL + "/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: empName,
          email: empEmail,
          role: empRole,
          branchId: empBranch,
          contact: empContact,
          salary: parseFloat(empSalary) || 0,
          status: empStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create employee.");

      setSuccessMessage("Employee added to roster successfully!");
      setShowAddModal(false);
      fetchRoster();
      
      setEmpName("");
      setEmpEmail("");
      setEmpContact("");
      setEmpSalary("3000");

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setCrudError(err.message || "Error connecting to server.");
    } finally {
      setCrudSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setCrudSubmitting(true);
    setCrudError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${editingEmp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: empName,
          email: empEmail,
          role: empRole,
          branchId: empBranch,
          contact: empContact,
          salary: parseFloat(empSalary) || 0,
          status: empStatus,
          incentives: parseFloat(empIncentives) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update employee.");

      setSuccessMessage("Employee record updated successfully!");
      setShowEditModal(false);
      setEditingEmp(null);
      fetchRoster();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setCrudError(err.message || "Error connecting to server.");
    } finally {
      setCrudSubmitting(false);
    }
  };

  const handleDelete = async (empId: string, empName: string) => {
    if (!window.confirm(`Are you sure you want to terminate and delete employee "${empName}" from the roster?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${empId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to terminate employee.");

      setSuccessMessage(`${empName} terminated and removed from active roster.`);
      fetchRoster();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Error deleting employee.");
    }
  };

  const handleShiftChange = async (userId: string, date: string, type: string) => {
    setShiftUpdatingId(`${userId}_${date}`);
    try {
      const res = await fetch(API_BASE_URL + "/api/employees/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, date, shiftType: type })
      });
      if (res.ok) {
        fetchShifts();
      }
    } catch (err) {
      console.error("Error saving shift update:", err);
    } finally {
      setShiftUpdatingId(null);
    }
  };

  const handleRunPayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayrollSubmitting(true);
    setPayrollError(null);

    try {
      const res = await fetch(API_BASE_URL + "/api/employees/payroll/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ month: payrollMonth })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to process payroll.");

      setSuccessMessage(`Payroll for month ${payrollMonth} processed successfully!`);
      setShowRunPayrollModal(false);
      fetchPayroll();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setPayrollError(err.message || "Error processing payroll.");
    } finally {
      setPayrollSubmitting(false);
    }
  };

  const downloadPayslip = async (payrollId: string, employeeName: string, month: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/payroll/${payrollId}/payslip`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load PDF payslip.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_${employeeName.replace(/\s+/g, "_")}_${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF payslip download error:", err);
      alert("Error downloading payslip PDF.");
    }
  };

  const shiftDates = useMemo(() => {
    return ["2026-05-23", "2026-05-24", "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"];
  }, []);

  const formatDateLabel = (dStr: string) => {
    const d = new Date(dStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    return `${dayName} ${dayNum}`;
  };

  const activeStaffList = useMemo(() => {
    return roster.filter(emp => emp.status === "active");
  }, [roster]);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      {successMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Employee Management</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Manage roles, incentives, shifts, and payroll records.
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === "roster" && user?.role === "super_admin" && (
            <button 
              onClick={() => {
                setCrudError(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Employee
            </button>
          )}
          {activeTab === "payroll" && user?.role === "super_admin" && (
            <button 
              onClick={() => {
                setPayrollError(null);
                setShowRunPayrollModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" /> Run Payroll Engine
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-luxury-border">
        {(["roster", "shifts", "payroll"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-gold-500 text-gold-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "roster" ? "Staff Roster" : tab === "shifts" ? "Shift Planner" : "Payroll & Salaries"}
          </button>
        ))}
      </div>

      {activeTab === "roster" && (
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border relative min-h-[250px]">
          {rosterLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/30 backdrop-blur-[2px] rounded-2xl">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          ) : rosterError ? (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/25 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {rosterError}
            </div>
          ) : roster.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              No staff members found on active roster.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400">
                <thead>
                  <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Assigned Cellar</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Incentives</th>
                    <th className="py-3 px-4">Status</th>
                    {user?.role === "super_admin" && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row) => (
                    <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm">{row.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase tracking-widest text-[9px] font-bold text-gold-500/80">
                          {row.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{row.branchName || "HQ Core Operations"}</td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="font-semibold text-zinc-300">{row.contact}</p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1"><Mail className="w-3 h-3 text-gold-500/80" /> {row.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono">RM {row.salary.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">RM {row.incentives.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${
                          row.status === "active" 
                            ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/25"
                            : "text-zinc-500 bg-zinc-950/30 border-zinc-700/25"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      {user?.role === "super_admin" && (
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 hover:bg-wine-950/40 rounded border border-luxury-border text-gold-500 hover:text-gold-400 transition-colors cursor-pointer inline-flex"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id, row.name)}
                            className="p-1.5 hover:bg-rose-950/20 rounded border border-transparent text-rose-400 hover:text-rose-300 transition-colors cursor-pointer inline-flex"
                            title="Terminate Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "shifts" && (
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border relative min-h-[250px]">
          {shiftsLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/30 backdrop-blur-[2px] rounded-2xl">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                <thead>
                  <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-3 px-4 min-w-[120px] sticky left-0 bg-luxury-dark z-10">Employee</th>
                    {shiftDates.map((d) => (
                      <th key={d} className="py-3 px-4 text-center min-w-[90px]">{formatDateLabel(d)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeStaffList.map((emp) => (
                    <tr key={emp.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm sticky left-0 bg-luxury-dark z-10 border-r border-luxury-border/30">
                        <div>
                          {emp.name}
                          <span className="text-[9px] text-zinc-500 font-sans block mt-0.5 font-normal uppercase tracking-widest">{emp.role.replace("_", " ")}</span>
                        </div>
                      </td>
                      {shiftDates.map((d) => {
                        const shiftRecord = shifts.find(s => s.user_id === emp.id && s.date === d);
                        const activeType = shiftRecord ? shiftRecord.shift_type : "off";
                        const isUpdating = shiftUpdatingId === `${emp.id}_${d}`;

                        return (
                          <td key={d} className="py-3.5 px-4 text-center">
                            {isUpdating ? (
                              <Loader2 className="w-4.5 h-4.5 animate-spin text-gold-500 mx-auto" />
                            ) : user?.role === "super_admin" || user?.role === "branch_manager" ? (
                              <select
                                value={activeType}
                                onChange={(e) => handleShiftChange(emp.id, d, e.target.value)}
                                className={`text-[10px] font-bold uppercase tracking-wider bg-luxury-black border rounded p-1 focus:outline-none cursor-pointer ${
                                  activeType === "morning"
                                    ? "text-sky-400 border-sky-500/25 bg-sky-950/20"
                                    : activeType === "afternoon"
                                      ? "text-purple-400 border-purple-500/25 bg-purple-950/20"
                                      : activeType === "full"
                                        ? "text-emerald-400 border-emerald-500/25 bg-emerald-950/20"
                                        : "text-zinc-500 border-zinc-700 bg-zinc-950/30"
                                }`}
                              >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="full">Full Shift</option>
                                <option value="off">Day Off</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                activeType === "morning"
                                  ? "text-sky-400 bg-sky-950/20"
                                  : activeType === "afternoon"
                                    ? "text-purple-400 bg-purple-950/20"
                                    : activeType === "full"
                                      ? "text-emerald-400 bg-emerald-950/20"
                                      : "text-zinc-500 bg-zinc-950/30"
                              }`}>
                                {activeType}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-luxury-border relative min-h-[250px]">
            {payrollLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/30 backdrop-blur-[2px] rounded-2xl">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : payroll.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs italic">
                No payroll distributions processed yet. Choose Run Payroll above to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead>
                    <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      <th className="py-3 px-4">Payroll Month</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Assigned Branch</th>
                      <th className="py-3 px-4">Base Salary</th>
                      <th className="py-3 px-4">Incentives</th>
                      <th className="py-3 px-4 text-rose-400">Deductions (EPF/SOCSO)</th>
                      <th className="py-3 px-4 text-emerald-400">Net Salary (RM)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.map((row) => (
                      <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{row.month}</td>
                        <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm">
                          <div>
                            {row.userName}
                            <span className="text-[9px] text-zinc-500 font-sans block mt-0.5 uppercase tracking-widest">{row.userRole.replace("_", " ")}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{row.branchName || "HQ Core Operations"}</td>
                        <td className="py-3.5 px-4 font-mono">RM {row.base_salary.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">RM {row.incentives.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-400">-RM {row.deductions.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">RM {row.net_salary.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" /> Disbursed
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => downloadPayslip(row.id, row.userName, row.month)}
                            className="p-1.5 hover:bg-wine-950/40 rounded border border-luxury-border text-gold-500 hover:text-gold-400 transition-colors cursor-pointer inline-flex"
                            title="Download Payslip PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold-500" /> Register Employee
            </h3>

            {crudError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {crudError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. Arun"
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="name@gunawines.my"
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Role Title
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="branch_manager">Branch Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="event_coordinator">Event Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Assigned Branch
                  </label>
                  <select
                    value={empBranch}
                    onChange={(e) => setEmpBranch(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="b1">KSL City Cellar</option>
                    <option value="b2">Mid Valley Cellar</option>
                    <option value="b3">Puteri Harbour Cellar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={empContact}
                    onChange={(e) => setEmpContact(e.target.value)}
                    placeholder="+60 12-345 6789"
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Base Salary (RM)
                  </label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    placeholder="3000"
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {crudSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Register Staff"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingEmp(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-gold-500" /> Edit Employee Record
            </h3>

            {crudError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {crudError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Work Email
                </label>
                <input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Role Title
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="branch_manager">Branch Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="event_coordinator">Event Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Assigned Branch
                  </label>
                  <select
                    value={empBranch}
                    onChange={(e) => setEmpBranch(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="b1">KSL City Cellar</option>
                    <option value="b2">Mid Valley Cellar</option>
                    <option value="b3">Puteri Harbour Cellar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={empContact}
                    onChange={(e) => setEmpContact(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Base Salary (RM)
                  </label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Incentives (RM)
                  </label>
                  <input
                    type="number"
                    value={empIncentives}
                    onChange={(e) => setEmpIncentives(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Status
                  </label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmp(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {crudSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RUN PAYROLL MODAL */}
      {showRunPayrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowRunPayrollModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold-500" /> Run Monthly Payroll
            </h3>

            {payrollError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {payrollError}
              </div>
            )}

            <form onSubmit={handleRunPayrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Target Processing Month
                </label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-2 block leading-normal">
                  Note: Running payroll will compute basic salaries, add active incentives, and apply EPF (11%), SOCSO (0.5%), and EIS (0.2%) Malaysian statutory deductions for all active staff.
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRunPayrollModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payrollSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {payrollSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Disburse Salaries"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
