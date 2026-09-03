import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './BookAppointment.css';

const API_BASE = '/api';

export default function BookAppointment() {
  const { user } = useAuth();

  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [slotsResponse, servicesResponse] = await Promise.all([
        fetch(`${API_BASE}/schedule/available`),
        fetch(`${API_BASE}/catalog`)
      ]);

      const slotsData = await slotsResponse.json();
      const servicesData = await servicesResponse.json();

      if (!slotsResponse.ok) {
        throw new Error(
          slotsData.message || 'Could not load available appointments.'
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData.message || 'Could not load services.'
        );
      }

      setSlots(Array.isArray(slotsData) ? slotsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);

    } catch (err) {
      console.error('Loading appointment data failed:', err);
      setMessage(err.message || 'Could not load appointment data.');
    } finally {
      setLoading(false);
    }
  };


  const getDoctorServices = (doctorId) => {
    return services.filter(
      (service) => Number(service.doctor_id) === Number(doctorId)
    );
  };


  const bookSlot = async (slot) => {
    if (!user?.patient_id) {
      setMessage('Patient account information is missing.');
      return;
    }

    setMessage('');
    setBookingSlotId(slot.slot_id);

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: user.patient_id,
          slot_id: slot.slot_id,
          doctor_id: slot.doctor_id,
          staff_id: slot.staff_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Could not book this appointment.'
        );
        return;
      }

      setMessage(
        `Appointment booked successfully. Appointment #${data.appointment_id}.`
      );

      await loadData();

    } catch (err) {
      console.error('Booking appointment failed:', err);

      setMessage(
        'Something went wrong while booking the appointment.'
      );

    } finally {
      setBookingSlotId(null);
    }
  };


  return (
    <div className="patient-page">
      <div className="patient-card">

        <h4 className="fw-bold mb-3">
          Book an Appointment
        </h4>

        {message && (
          <div className="alert patient-alert py-2">
            {message}
          </div>
        )}

        {loading && (
          <p className="patient-empty">
            Loading available appointments...
          </p>
        )}

        {!loading && slots.length === 0 && (
          <p className="patient-empty">
            No open slots right now.
          </p>
        )}

        {!loading && slots.length > 0 && (
          <div>
            {slots.map((slot) => {
              const doctorServices = getDoctorServices(slot.doctor_id);

              return (
                <div
                  key={slot.slot_id}
                  className="patient-list-item d-flex justify-content-between align-items-center flex-wrap gap-3"
                >
                  <div>
                    <div className="patient-time">
                      {new Date(
                        slot.date_and_time
                      ).toLocaleString()}
                    </div>

                    <div className="patient-doctor">
                      Dr. {slot.staff_name}
                    </div>

                    {doctorServices.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Services:
                        </small>

                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {doctorServices.map((service) => (
                            <span
                              key={service.catalog_id}
                              className="badge bg-light text-dark border"
                            >
                              {service.modality} — ${Number(
                                service.price
                              ).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {doctorServices.length === 0 && (
                      <div className="text-muted mt-1">
                        <small>
                          No services listed for this doctor.
                        </small>
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-teal-outline btn-sm"
                    onClick={() => bookSlot(slot)}
                    disabled={bookingSlotId === slot.slot_id}
                  >
                    {bookingSlotId === slot.slot_id
                      ? 'Booking...'
                      : 'Book'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}