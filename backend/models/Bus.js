const mongoose = require('mongoose');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour "HH:mm"

const busSchema = new mongoose.Schema(
  {
    operator: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true,
      maxlength: [100, 'Operator name cannot exceed 100 characters'],
    },
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [20, 'Bus number cannot exceed 20 characters'],
    },
    coachType: {
      type: String,
      enum: {
        values: ['AC', 'Non-AC'],
        message: 'Coach type must be either AC or Non-AC',
      },
      required: [true, 'Coach type is required'],
      default: 'Non-AC',
    },
    source: {
      type: String,
      required: [true, 'Source city is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    journeyDate: {
      type: Date,
      required: [true, 'Journey date is required'],
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      match: [TIME_REGEX, 'Departure time must be in HH:mm 24-hour format'],
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
      match: [TIME_REGEX, 'Arrival time must be in HH:mm 24-hour format'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
      maxlength: [20, 'Duration cannot exceed 20 characters'],
    },
    fare: {
      type: Number,
      required: [true, 'Fare is required'],
      min: [0, 'Fare cannot be negative'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'A bus must have at least 1 seat'],
      max: [100, 'Total seats cannot exceed 100'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [0, 'Available seats cannot be negative'],
      validate: {
        validator: function (value) {
          // `this` refers to the document on save(); on findOneAndUpdate
          // validators, totalSeats may not be present unless explicitly set —
          // routes always send both fields together to keep this reliable.
          if (this.totalSeats === undefined || this.totalSeats === null) return true;
          return value <= this.totalSeats;
        },
        message: 'Available seats cannot exceed total seats',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Default availableSeats to totalSeats on creation if not explicitly provided
busSchema.pre('validate', function (next) {
  if ((this.availableSeats === undefined || this.availableSeats === null) && this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Speeds up the common search-by-route-and-date query
busSchema.index({ source: 1, destination: 1, journeyDate: 1 });

module.exports = mongoose.model('Bus', busSchema);