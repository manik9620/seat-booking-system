# Seat Booking System (demo)

Demo app for the guidance sessions. Built with Create React App, same setup as the assessment.

## Run it

```bash
npm install
npm start
```

Open http://localhost:3000

## What's in here

- `src/SeatBooking.js` - main file: constants, pricing tiers, seat grid, booking logic, UI
- `src/hooks/useLocalStorage.js` - small custom hook to keep booked seats after refresh
- `src/SeatBooking.css` - styles

## Done in the demo

- 8x10 grid, rows A-H, Premium / Standard / Economy pricing
- Select / deselect seats, live total, live counters
- Clear selection
- Confirm dialog before booking
- Booked seats saved in localStorage

## Left for you (see TODOs in `SeatBooking.js`)

- Max 8 seats per booking with an error message
- Seat continuity rule (no single available seat stuck between selected/booked seats)
- Reset all seats and clear saved data
