import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Billing() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [payingBillId, setPayingBillId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const response = await fetch(`${API_BASE}/billing/patient/${user.patient_id}`);
    const data = await response.json();
    setBills(data);
  };

  const payBill = async (billId) => {
    if (!paymentMethod) {
      setMessage('Please enter a payment method.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/billing/${billId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not process payment.');
        return;
      }

      setMessage('Payment recorded.');
      setPayingBillId(null);
      setPaymentMethod('');
      loadBills();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-3">Billing</h4>

      {message && <div className="alert alert-info py-2">{message}</div>}

      {bills.length === 0 && <p className="text-muted">No bills yet.</p>}

      <div className="list-group">
        {bills.map((bill) => (
          <div key={bill.bill_id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div>${bill.amount}</div>
              <div>
                <span className={`badge me-2 ${bill.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {bill.status}
                </span>
                {bill.status === 'unpaid' && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setPayingBillId(payingBillId === bill.bill_id ? null : bill.bill_id)}
                  >
                    Pay now
                  </button>
                )}
              </div>
            </div>

            {bill.status === 'paid' && (
              <div className="text-muted small mt-1">
                Paid on {bill.payment_date} via {bill.payment_method}
              </div>
            )}

            {payingBillId === bill.bill_id && (
              <div className="mt-3 d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '220px' }}
                  placeholder="Payment method (e.g. Visa ending 4417)"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => payBill(bill.bill_id)}>Confirm Payment</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}