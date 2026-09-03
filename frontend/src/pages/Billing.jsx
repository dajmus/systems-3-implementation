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
    try {
      const response = await fetch(`${API_BASE}/billing/patient/${user.patient_id}`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not load bills.');
        return;
      }

      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage('Could not load bills.');
    }
  };

  const payBill = async (billId) => {
    if (!paymentMethod) {
      setMessage('Please select a payment method.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/billing/${billId}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentMethod
        })
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
    <div
      style={{
        minHeight: 'calc(100vh - 73px)',
        backgroundColor: '#28777b',
        padding: '48px 24px'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px'
            }}
          >
            Billing
          </h1>

          <p
            style={{
              color: '#ffffff',
              fontSize: '18px',
              margin: 0
            }}
          >
            View and pay your clinic bills.
          </p>
        </div>

        {message && (
          <div
            className="alert alert-info"
            style={{
              maxWidth: '700px',
              margin: '0 auto 25px'
            }}
          >
            {message}
          </div>
        )}

        {bills.length === 0 && !message && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '7px',
              padding: '25px',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#666666',
                fontSize: '17px'
              }}
            >
              No bills yet.
            </p>
          </div>
        )}

        {bills.map((bill) => (
          <div
            key={bill.bill_id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '7px',
              padding: '22px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '21px',
                    fontWeight: '700',
                    color: '#111111',
                    marginBottom: '5px'
                  }}
                >
                  ${Number(bill.amount).toFixed(2)}
                </div>

                <div
                  style={{
                    color: '#666666',
                    fontSize: '16px'
                  }}
                >
                  Bill #{bill.bill_id}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#28777b',
                    color: '#ffffff',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                >
                  {bill.status}
                </span>

                {bill.status === 'unpaid' && (
                  <div>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#28777b',
                        color: '#ffffff',
                        border: '1px solid #28777b'
                      }}
                      onClick={() =>
                        setPayingBillId(
                          payingBillId === bill.bill_id
                            ? null
                            : bill.bill_id
                        )
                      }
                    >
                      Pay now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {bill.status === 'paid' && (
              <div
                style={{
                  color: '#666666',
                  fontSize: '16px',
                  marginTop: '12px'
                }}
              >
                Paid on {bill.payment_date} via {bill.payment_method}
              </div>
            )}

            {payingBillId === bill.bill_id && (
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #dddddd'
                }}
              >
                <label
                  htmlFor={`payment-${bill.bill_id}`}
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#111111'
                  }}
                >
                  Payment method
                </label>

                <select
                  id={`payment-${bill.bill_id}`}
                  className="form-select"
                  style={{
                    maxWidth: '300px',
                    marginBottom: '12px'
                  }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select payment method</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank transfer">Bank transfer</option>
                </select>

                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: '#28777b',
                    color: '#ffffff',
                    border: '1px solid #28777b'
                  }}
                  onClick={() => payBill(bill.bill_id)}
                >
                  Confirm Payment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}