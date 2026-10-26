import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import './SeatBooking.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;
const TOTAL_SEATS = ROWS.length * SEATS_PER_ROW;

const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
};

const PRICING = [
  { tier: 'Premium', rows: ['A', 'B', 'C'], price: 1000 },
  { tier: 'Standard', rows: ['D', 'E', 'F'], price: 750 },
  { tier: 'Economy', rows: ['G', 'H'], price: 500 },
];

const STORAGE_KEY = 'bookedSeats';

const getTier = (row) => PRICING.find((p) => p.rows.includes(row));
const getSeatPrice = (seatId) => getTier(seatId[0]).price;
const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// builds the 8x10 grid, e.g. [['A1', 'A2', ...], ['B1', ...], ...]
const SEAT_GRID = ROWS.map((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, i) => `${row}${i + 1}`)
);

function SeatBooking() {
  // only two lists live in state, everything else is calculated from them
  const [bookedSeats, setBookedSeats] = useLocalStorage(STORAGE_KEY, []);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState(null);

  const getStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return SEAT_STATUS.BOOKED;
    if (selectedSeats.includes(seatId)) return SEAT_STATUS.SELECTED;
    return SEAT_STATUS.AVAILABLE;
  };

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0),
    [selectedSeats]
  );

  const counts = {
    available: TOTAL_SEATS - bookedSeats.length - selectedSeats.length,
    selected: selectedSeats.length,
    booked: bookedSeats.length,
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setMessage(null);

    // TODO (homework): max 8 seats per booking, show an error if they try for more
    // TODO (homework): don't allow a single available seat to be left stuck
    //   between selected/booked seats, e.g. [Selected][Available][Selected]

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleBookClick = () => {
    if (selectedSeats.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one seat first.' });
      return;
    }
    setShowConfirm(true);
  };

  const confirmBooking = () => {
    setBookedSeats((prev) => [...prev, ...selectedSeats]);
    setMessage({
      type: 'success',
      text: `${selectedSeats.length} seat(s) booked for ${formatPrice(totalPrice)}.`,
    });
    setSelectedSeats([]);
    setShowConfirm(false);
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setMessage(null);
  };

  // TODO (homework): reset everything back to available and wipe saved data

  return (
    <div className="booking">
      <h1>Seat Booking System</h1>

      <div className="legend">
        <span><i className="seat-dot available" /> Available</span>
        <span><i className="seat-dot selected" /> Selected</span>
        <span><i className="seat-dot booked" /> Booked</span>
        {PRICING.map((p) => (
          <span key={p.tier}>
            {p.tier} ({p.rows[0]}-{p.rows[p.rows.length - 1]}): {formatPrice(p.price)}
          </span>
        ))}
      </div>

      <div className="screen">SCREEN</div>

      <div className="grid">
        {SEAT_GRID.map((rowSeats, rowIndex) => (
          <div className="row" key={ROWS[rowIndex]}>
            <span className="row-label">{ROWS[rowIndex]}</span>
            {rowSeats.map((seatId) => {
              const status = getStatus(seatId);
              return (
                <button
                  key={seatId}
                  className={`seat ${status}`}
                  onClick={() => handleSeatClick(seatId)}
                  disabled={status === SEAT_STATUS.BOOKED}
                  title={`${seatId} - ${formatPrice(getSeatPrice(seatId))}`}
                >
                  {seatId.slice(1)}
                </button>
              );
            })}
            <span className="row-tier">{getTier(ROWS[rowIndex]).tier}</span>
          </div>
        ))}
      </div>

      <div className="counters">
        <Counter label="Available" value={counts.available} />
        <Counter label="Selected" value={counts.selected} />
        <Counter label="Booked" value={counts.booked} />
      </div>

      <div className="summary">
        <p>
          {selectedSeats.length > 0 ? `Selected: ${selectedSeats.join(', ')}` : 'No seats selected'}
        </p>
        <p className="total">Total: {formatPrice(totalPrice)}</p>
      </div>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}

      <div className="actions">
        <button className="btn" onClick={clearSelection} disabled={selectedSeats.length === 0}>
          Clear Selection
        </button>
        <button className="btn primary" onClick={handleBookClick}>
          Book Seats
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          seats={selectedSeats}
          total={totalPrice}
          onConfirm={confirmBooking}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

function Counter({ label, value }) {
  return (
    <div className="counter">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ConfirmModal({ seats, total, onConfirm, onCancel }) {
  // close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Confirm Booking</h2>
        <p>Seats ({seats.length}): {seats.join(', ')}</p>
        <p>Total: <strong>{formatPrice(total)}</strong></p>
        <div className="actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={onConfirm} autoFocus>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default SeatBooking;
