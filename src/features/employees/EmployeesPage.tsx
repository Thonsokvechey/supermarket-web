import React, { useState } from 'react';
import { UserPlus, Building, Briefcase } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { erpService } from '../../services/erpService';
import { useAuth } from '../../hooks/useAuth';
import type { Department, Employee, Position } from '../../types';
import { formatUsd } from '../../utils/formatters';

export const EmployeesPage: React.FC = () => {
  const { activeBranch } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(() => erpService.getEmployees());
  const [departments, setDepartments] = useState<Department[]>(() => erpService.getDepartments());
  const [positions, setPositions] = useState<Position[]>(() => erpService.getPositions());

  // Modals
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [posModalOpen, setPosModalOpen] = useState(false);

  // Employee Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [selectedPosId, setSelectedPosId] = useState(positions[0]?.id || '');
  const [salaryUsd, setSalaryUsd] = useState('450');

  // Department Form
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Position Form
  const [posTitle, setPosTitle] = useState('');
  const [posDeptId, setPosDeptId] = useState(departments[0]?.id || '');
  const [posDesc, setPosDesc] = useState('');

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === selectedDeptId);
    const pos = positions.find((p) => p.id === selectedPosId);
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      code: `EMP-00${employees.length + 1}`,
      fullName,
      email,
      phone,
      departmentId: selectedDeptId,
      departmentName: dept?.name || 'General',
      positionId: selectedPosId,
      positionTitle: pos?.title || 'Staff',
      branchId: activeBranch?.id || 'main',
      branchName: activeBranch?.name || 'Main Branch',
      salaryUsd: Number(salaryUsd),
      hireDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    };
    setEmployees(erpService.saveEmployee(newEmp));
    setEmpModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      branchId: activeBranch?.id || 'main',
      branchName: activeBranch?.name || 'Main Branch',
      name: deptName,
      description: deptDesc,
      isActive: true,
    };
    setDepartments(erpService.saveDepartment(newDept));
    setDeptModalOpen(false);
    setDeptName('');
    setDeptDesc('');
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === posDeptId);
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      departmentId: posDeptId,
      departmentName: dept?.name || 'General',
      title: posTitle,
      description: posDesc,
      isActive: true,
    };
    setPositions(erpService.savePosition(newPos));
    setPosModalOpen(false);
    setPosTitle('');
    setPosDesc('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees, Departments & Positions"
        subtitle="Aligned with Department and Position entities in supermarket-backend"
        actions={
          <>
            <button
              type="button"
              onClick={() => setDeptModalOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5" />
              <span>New Department</span>
            </button>
            <button
              type="button"
              onClick={() => setPosModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>New Position</span>
            </button>
            <button
              type="button"
              onClick={() => setEmpModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          </>
        }
      />

      {/* Staff Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Employee Directory ({employees.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Hire Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                    {emp.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{emp.fullName}</div>
                    <div className="text-xs text-slate-500">
                      {emp.email} • {emp.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{emp.departmentName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium">
                      {emp.positionTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{emp.branchName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {formatUsd(emp.salaryUsd)}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{emp.hireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments & Positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Departments ({departments.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {departments.map((d) => (
              <div key={d.id} className="p-4">
                <div className="font-bold text-slate-900">{d.name}</div>
                <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Positions ({positions.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {positions.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{p.title}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                  {p.departmentName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={empModalOpen}
        onClose={() => setEmpModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
              <select
                value={selectedPosId}
                onChange={(e) => setSelectedPosId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Salary (USD)
            </label>
            <input
              type="number"
              required
              min="0"
              value={salaryUsd}
              onChange={(e) => setSalaryUsd(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEmpModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* New Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title="New Department"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* New Position Modal */}
      <Modal
        isOpen={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        title="New Position"
      >
        <form onSubmit={handleCreatePosition} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Position Title *
            </label>
            <input
              type="text"
              required
              value={posTitle}
              onChange={(e) => setPosTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={posDeptId}
              onChange={(e) => setPosDeptId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={posDesc}
              onChange={(e) => setPosDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPosModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              Save Position
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

