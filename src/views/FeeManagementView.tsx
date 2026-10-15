import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import type { FeeStructure, FeePayment, Student } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';

export const FeeManagementView: React.FC = () => {
  const { user, isOnline, isAdmin, isTeacher } = useAuth();
  const { students, schoolConfig, activeStream } = useGrading();

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFee, setShowCreateFee] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState<{ student?: Student; feeStructure?: FeeStructure } | false>(false);
  const [feeForm, setFeeForm] = useState({
    name: '',
    form: '',
    term: '',
    year: new Date().getFullYear(),
    amount: 0,
    due_date: '',
    description: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    fee_structure_id: '',
    amount_paid: 0,
    payment_method: 'cash' as 'mpesa' | 'cash' | 'bank' | 'card' | 'cheque',
    mpesa_code: '',
  });

  useEffect(() => {
    if (!isOnline || !user || !supabase) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isOnline, user]);

  const loadData = async () => {
    if (!supabase || !user) return;

    try {
      const [{ data: structures }, { data: paymentsData }] = await Promise.all([
        supabase.from('fee_structures').select('*').eq('school_id', user.school_id).eq('is_active', true).order('due_date'),
        supabase.from('fee_payments').select('*').eq('school_id', user.school_id).order('paid_at', { ascending: false }).limit(200),
      ]);

      setFeeStructures(structures || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('[Fees] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    try {
      const { error } = await supabase.from('fee_structures').insert({
        school_id: user.school_id,
        ...feeForm,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setShowCreateFee(false);
      setFeeForm({ name: '', form: '', term: '', year: new Date().getFullYear(), amount: 0, due_date: '', description: '' });
      loadData();
    } catch (err) {
      console.error('[Fees] Failed to create:', err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    try {
      const { error } = await supabase.from('fee_payments').insert({
        school_id: user.school_id,
        ...paymentForm,
        received_by: user.id,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setShowRecordPayment(false);
      setPaymentForm({ student_id: '', fee_structure_id: '', amount_paid: 0, payment_method: 'cash', mpesa_code: '' });
      loadData();
    } catch (err) {
      console.error('[Fees] Failed to record:', err);
    }
  };

  const streamStudents = useMemo(() => students.filter(s => s.stream === activeStream && s.status === 'Active'), [students, activeStream]);

  const feeStats = useMemo(() => {
    const totalExpected = feeStructures.reduce((sum, f) => sum + f.amount * streamStudents.length, 0);
    const totalCollected = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount_paid, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount_paid, 0);
    return { totalExpected, totalCollected, pending, balance: totalExpected - totalCollected };
  }, [feeStructures, payments, streamStudents]);

  const getStudentBalance = (studentId: string) => {
    const studentFees = feeStructures.filter(f =>
      f.form === 'All' || f.form === activeStream.split(' ')[0]
    );
    const expected = studentFees.reduce((sum, f) => sum + f.amount, 0);
    const paid = payments
      .filter(p => p.student_id === studentId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount_paid, 0);
    return { expected, paid, balance: expected - paid };
  };

  if (!isOnline || (!isAdmin && !isTeacher)) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Fee Management - Access Required</h2>
          <p className="text-[#5F5E5E]">Admin or Teacher access required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2410C] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Fee Management</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            {schoolConfig.schoolName} · {activeStream} · {schoolConfig.term} {schoolConfig.academicYear}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateFee(true)} className="px-4 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95">
            <span className="material-symbols-outlined mr-1">add</span> Add Fee Structure
          </button>
          <button onClick={() => setShowRecordPayment({})} className="px-4 py-2 border border-[#C2410C] text-[#C2410C] rounded font-semibold hover:bg-[#FEF3E2]">
            <span className="material-symbols-outlined mr-1">payments</span> Record Payment
          </button>
        </div>
      </section>

      {/* Fee Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">TOTAL EXPECTED</div>
          <div className="font-display-stat text-display-stat text-[#111111]">KES {feeStats.totalExpected.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">COLLECTED</div>
          <div className="font-display-stat text-display-stat text-[#166534]">KES {feeStats.totalCollected.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">PENDING</div>
          <div className="font-display-stat text-display-stat text-[#C2410C]">KES {feeStats.pending.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-[#DDD6C7] p-4 rounded">
          <div className="font-label-caps text-label-caps text-[#5F5E5E] mb-1">BALANCE</div>
          <div className={`font-display-stat text-display-stat ${feeStats.balance > 0 ? 'text-[#991B1B]' : 'text-[#166534]'}`}>
            KES {feeStats.balance.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Fee Structures */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-[#111111]">Fee Structures</h2>
          <button onClick={() => setShowCreateFee(true)} className="text-[#C2410C] text-sm font-medium hover:underline">Add New</button>
        </div>
        {feeStructures.length === 0 ? (
          <div className="bg-white border border-[#DDD6C7] rounded p-8 text-center text-[#5F5E5E]">
            No fee structures defined. Create one to get started.
          </div>
        ) : (
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                  <th className="py-2 px-3">NAME</th>
                  <th className="py-2 px-3">FORM</th>
                  <th className="py-2 px-3">TERM</th>
                  <th className="py-2 px-3">YEAR</th>
                  <th className="py-2 px-3 text-right">AMOUNT</th>
                  <th className="py-2 px-3">DUE DATE</th>
                  <th className="py-2 px-3">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                {feeStructures.map(fee => (
                  <tr key={fee.id} className="hover:bg-[#FBF8F1]">
                    <td className="py-2 px-3 font-medium">{fee.name}</td>
                    <td className="py-2 px-3">{fee.form}</td>
                    <td className="py-2 px-3">{fee.term}</td>
                    <td className="py-2 px-3 font-tabular-sm">{fee.year}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm font-semibold">KES {fee.amount.toLocaleString()}</td>
                    <td className="py-2 px-3">{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 text-[#5F5E5E]">{fee.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Student Fee Balances */}
      <section>
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Student Fee Balances ({activeStream})</h2>
        <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-3">ADM NO</th>
                <th className="py-2 px-3">STUDENT</th>
                <th className="py-2 px-3 text-right">EXPECTED</th>
                <th className="py-2 px-3 text-right">PAID</th>
                <th className="py-2 px-3 text-right">BALANCE</th>
                <th className="py-2 px-3">STATUS</th>
                <th className="py-2 px-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {streamStudents.map(student => {
                const balance = getStudentBalance(student.id);
                const status = balance.balance <= 0 ? 'CLEARED' : balance.paid > 0 ? 'PARTIAL' : 'PENDING';
                return (
                  <tr key={student.id} className="hover:bg-[#FBF8F1]">
                    <td className="py-2 px-3 font-tabular-sm">{student.admNo}</td>
                    <td className="py-2 px-3 font-medium">{student.name}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm">KES {balance.expected.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm text-[#166534]">KES {balance.paid.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm font-semibold">
                      {balance.balance > 0 ? (
                        <span className="text-[#991B1B]">KES {balance.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-[#166534]">CLEARED</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        status === 'CLEARED' ? 'bg-[#F0FDF4] text-[#166534]' :
                        status === 'PARTIAL' ? 'bg-[#FEF3E2] text-[#C2410C]' :
                        'bg-[#FEF2F2] text-[#991B1B]'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => setShowRecordPayment({ student, feeStructure: feeStructures[0] })}
                        className="text-[#C2410C] text-sm hover:underline"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Payments */}
      <section className="mt-6">
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Recent Payments</h2>
        <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                <th className="py-2 px-3">DATE</th>
                <th className="py-2 px-3">STUDENT</th>
                <th className="py-2 px-3">FEE TYPE</th>
                <th className="py-2 px-3 text-right">AMOUNT</th>
                <th className="py-2 px-3">METHOD</th>
                <th className="py-2 px-3">MPESA CODE</th>
                <th className="py-2 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
              {payments.slice(0, 20).map(payment => {
                const student = students.find(s => s.id === payment.student_id);
                const fee = feeStructures.find(f => f.id === payment.fee_structure_id);
                return (
                  <tr key={payment.id} className="hover:bg-[#FBF8F1]">
                    <td className="py-2 px-3">{new Date(payment.paid_at).toLocaleString()}</td>
                    <td className="py-2 px-3">{student?.name || 'Unknown'}</td>
                    <td className="py-2 px-3">{fee?.name || 'Unknown'}</td>
                    <td className="py-2 px-3 text-right font-tabular-sm font-semibold">KES {payment.amount_paid.toLocaleString()}</td>
                    <td className="py-2 px-3 capitalize">{payment.payment_method}</td>
                    <td className="py-2 px-3 font-tabular-sm text-[#5F5E5E]">{payment.mpesa_code || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        payment.status === 'completed' ? 'bg-[#F0FDF4] text-[#166534]' :
                        payment.status === 'pending' ? 'bg-[#FEF3E2] text-[#C2410C]' :
                        'bg-[#FEF2F2] text-[#991B1B]'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5F5E5E]">No payments recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Fee Modal */}
      {showCreateFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateFee(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#DDD6C7] flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">New Fee Structure</h2>
              <button onClick={() => setShowCreateFee(false)} className="text-[#5F5E5E] hover:text-[#111111] text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateFee} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Name</label>
                <input value={feeForm.name} onChange={e => setFeeForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" placeholder="Term 2 Tuition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Form</label>
                  <select value={feeForm.form} onChange={e => setFeeForm(prev => ({ ...prev, form: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                    <option value="All">All Forms</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Term</label>
                  <select value={feeForm.term} onChange={e => setFeeForm(prev => ({ ...prev, term: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Year</label>
                  <input type="number" value={feeForm.year} onChange={e => setFeeForm(prev => ({ ...prev, year: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Amount (KES)</label>
                  <input type="number" value={feeForm.amount} onChange={e => setFeeForm(prev => ({ ...prev, amount: parseInt(e.target.value) }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Due Date</label>
                <input type="date" value={feeForm.due_date} onChange={e => setFeeForm(prev => ({ ...prev, due_date: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
                <textarea value={feeForm.description} onChange={e => setFeeForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD6C7]">
                <button type="button" onClick={() => setShowCreateFee(false)} className="px-4 py-2 border border-[#DDD6C7] text-[#111111] rounded hover:bg-[#F2EDE3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#C2410C] text-white rounded hover:opacity-95">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRecordPayment(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#DDD6C7] flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-[#111111]">Record Payment</h2>
              <button onClick={() => setShowRecordPayment(false)} className="text-[#5F5E5E] hover:text-[#111111] text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Student</label>
                <select value={paymentForm.student_id} onChange={e => setPaymentForm(prev => ({ ...prev, student_id: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                  <option value="">Select Student</option>
                  {streamStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.admNo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Fee Structure</label>
                <select value={paymentForm.fee_structure_id} onChange={e => setPaymentForm(prev => ({ ...prev, fee_structure_id: e.target.value }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                  <option value="">Select Fee</option>
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - KES {f.amount.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Amount Paid</label>
                  <input type="number" value={paymentForm.amount_paid} onChange={e => setPaymentForm(prev => ({ ...prev, amount_paid: parseInt(e.target.value) }))} required className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1">Method</label>
                  <select value={paymentForm.payment_method} onChange={e => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value as any }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]">
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">M-Pesa Code (if applicable)</label>
                <input value={paymentForm.mpesa_code} onChange={e => setPaymentForm(prev => ({ ...prev, mpesa_code: e.target.value }))} className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]" placeholder="NLJ7RT61BV" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD6C7]">
                <button type="button" onClick={() => setShowRecordPayment(false)} className="px-4 py-2 border border-[#DDD6C7] text-[#111111] rounded hover:bg-[#F2EDE3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#C2410C] text-white rounded hover:opacity-95">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};