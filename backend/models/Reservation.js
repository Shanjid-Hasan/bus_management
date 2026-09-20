//reservation schema

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    seats: {
      type: [Number],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: (arr) => arr.length > 0 && arr.length <= 4,
        message: 'You can book between 1 and 4 seats per reservation',
      },
    },
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
      maxlength: [100, 'Passenger name cannot exceed 100 characters'],
    },
    passengerPhone: {
      type: String,
      required: [true, 'Passenger phone is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    passengerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    totalFare: {
      type: Number,
      required: [true, 'Total fare is required'],
      min: [0, 'Total fare cannot be negative'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    // Snapshot of bus details at booking time (so the ticket is always accurate
    // even if the bus record is later edited)
    busSnapshot: {
      operator:      String,
      busNumber:     String,
      source:        String,
      destination:   String,
      journeyDate:   Date,
      departureTime: String,
      arrivalTime:   String,
      duration:      String,
      coachType:     String,
      fare:          Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast "my reservations" lookups
reservationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
