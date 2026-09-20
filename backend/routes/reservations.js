const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/auth');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// ─── POST /api/reservations — create a booking ─────────────────
router.post(
  '/',
  protect,
  [
    body('busId').notEmpty().withMessage('Bus ID is required').isMongoId().withMessage('Invalid Bus ID'),
    body('seats').isArray({ min: 1, max: 4 }).withMessage('Select between 1 and 4 seats'),
    body('seats.*').isInt({ min: 1 }).withMessage('Seat numbers must be positive integers'),
    body('passengerName').trim().notEmpty().withMessage('Passenger name is required').isLength({ max: 100 }),
    body('passengerPhone').trim().notEmpty().withMessage('Passenger phone is required').isLength({ max: 20 }),
    body('passengerEmail').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { busId, seats, passengerName, passengerPhone, passengerEmail } = req.body;

      // 1. Check if bus exists
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ success: false, message: 'Bus not found' });
      }

      if (bus.status !== 'scheduled') {
        return res.status(400).json({ success: false, message: 'This bus is no longer accepting bookings' });
      }

      // 2. Validate seat numbers
      const requestedSeats = seats.map(Number);
      const outOfRange = requestedSeats.filter((s) => s < 1 || s > bus.totalSeats);
      if (outOfRange.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Seat(s) ${outOfRange.join(', ')} do not exist on this bus.`,
        });
      }

      // 3. Check for already booked seats in local bus state
      const alreadyBooked = requestedSeats.filter((s) => bus.bookedSeats && bus.bookedSeats.includes(s));
      if (alreadyBooked.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${alreadyBooked.join(', ')} are no longer available. Please choose different seats.`,
        });
      }

      // 4. Check available capacity
      if (requestedSeats.length > bus.availableSeats) {
        return res.status(409).json({
          success: false,
          message: `Only ${bus.availableSeats} seat(s) remaining. Please reduce your selection.`,
        });
      }

      // 5. Atomically lock seats and update capacity on the bus document
      const updatedBus = await Bus.findOneAndUpdate(
        {
          _id: busId,
          status: 'scheduled',
          bookedSeats: { $nin: requestedSeats },
          availableSeats: { $gte: requestedSeats.length },
        },
        {
          $push: { bookedSeats: { $each: requestedSeats } },
          $inc: { availableSeats: -requestedSeats.length },
        },
        { new: true }
      );

      if (!updatedBus) {
        return res.status(409).json({
          success: false,
          message: 'One or more selected seats were just taken. Please choose different seats.',
        });
      }

      const totalFare = bus.fare * requestedSeats.length;

      // 6. Create reservation document
      let reservation;
      try {
        reservation = await Reservation.create({
          bus: bus._id,
          user: req.user._id,
          seats: requestedSeats,
          passengerName,
          passengerPhone,
          passengerEmail: passengerEmail || '',
          totalFare,
          busSnapshot: {
            operator:      bus.operator,
            busNumber:     bus.busNumber,
            source:        bus.source,
            destination:   bus.destination,
            journeyDate:   bus.journeyDate,
            departureTime: bus.departureTime,
            arrivalTime:   bus.arrivalTime,
            duration:      bus.duration,
            coachType:     bus.coachType,
            fare:          bus.fare,
          },
        });
      } catch (createError) {
        // Rollback bus seat update if reservation document creation fails
        await Bus.findByIdAndUpdate(busId, {
          $pull: { bookedSeats: { $in: requestedSeats } },
          $inc: { availableSeats: requestedSeats.length },
        });
        throw createError;
      }

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed!',
        reservation,
      });
    } catch (error) {
      console.error('Create reservation error:', error);
      if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0]?.message || 'Validation error';
        return res.status(400).json({ success: false, message });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error while creating reservation',
      });
    }
  }
);

// ─── GET /api/reservations/my — current user's bookings ────────
router.get('/my', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error('Fetch my reservations error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching reservations' });
  }
});

// ─── GET /api/reservations/:id — single reservation ────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Users can only see their own reservations; admins/managers can see any
    if (
      reservation.user.toString() !== req.user._id.toString() &&
      !['admin', 'manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this reservation' });
    }

    res.status(200).json({ success: true, reservation });
  } catch (error) {
    console.error('Fetch reservation error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching reservation' });
  }
});

module.exports = router;
