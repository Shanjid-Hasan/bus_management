const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const MANAGE_ROLES = ['admin', 'manager'];

// ─── Shared validation rules ───────────────────────────────────
const busValidationRules = (isUpdate = false) => {
  const optionalIfUpdate = (validator) =>
    isUpdate ? validator.optional() : validator.notEmpty().withMessage('This field is required');

  return [
    optionalIfUpdate(body('operator').trim()).isLength({ max: 100 }).withMessage('Operator name cannot exceed 100 characters'),
    optionalIfUpdate(body('busNumber').trim()).isLength({ max: 20 }).withMessage('Bus number cannot exceed 20 characters'),
    optionalIfUpdate(body('coachType')).isIn(['AC', 'Non-AC']).withMessage('Coach type must be AC or Non-AC'),
    optionalIfUpdate(body('source').trim()),
    optionalIfUpdate(body('destination').trim()),
    optionalIfUpdate(body('journeyDate')).isISO8601().withMessage('Journey date must be a valid date'),
    optionalIfUpdate(body('departureTime')).matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Departure time must be in HH:mm format'),
    optionalIfUpdate(body('arrivalTime')).matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Arrival time must be in HH:mm format'),
    optionalIfUpdate(body('duration').trim()),
    optionalIfUpdate(body('fare')).isFloat({ min: 0 }).withMessage('Fare must be a positive number'),
    optionalIfUpdate(body('totalSeats')).isInt({ min: 1, max: 100 }).withMessage('Total seats must be between 1 and 100'),
    body('availableSeats').optional().isInt({ min: 0 }).withMessage('Available seats cannot be negative'),
    body('status').optional().isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid status'),
  ];
};

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

// ─── GET /api/buses/search — any authenticated user ────────────
// Public-to-users route for the passenger-facing SearchBus page.
router.get(
  '/search',
  protect,
  [
    query('maxFare').optional().isFloat({ min: 0 }),
    query('date').optional().isISO8601(),
    query('sort').optional().isIn(['recommended', 'price', 'departure']),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { source, destination, date, coachType, maxFare, sort } = req.query;

      const filter = { status: 'scheduled' };

      if (source) filter.source = { $regex: source.trim(), $options: 'i' };
      if (destination) filter.destination = { $regex: destination.trim(), $options: 'i' };
      if (coachType && coachType !== 'All') filter.coachType = coachType;
      if (maxFare) filter.fare = { $lte: Number(maxFare) };

      if (date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        filter.journeyDate = { $gte: dayStart, $lte: dayEnd };
      }

      let sortOption = { journeyDate: 1, departureTime: 1 };
      if (sort === 'price') sortOption = { fare: 1 };
      else if (sort === 'departure') sortOption = { departureTime: 1 };

      const buses = await Bus.find(filter).sort(sortOption).limit(100);

      res.status(200).json({
        success: true,
        count: buses.length,
        buses,
      });
    } catch (error) {
      console.error('Bus search error:', error);
      res.status(500).json({ success: false, message: 'Server error while searching buses' });
    }
  }
);

// ─── GET /api/buses/:id — any authenticated user ────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching bus' });
  }
});

// ─── GET /api/buses — admin/manager only (management dashboard) ─
router.get('/', protect, authorize(...MANAGE_ROLES), async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    console.error('Fetch buses error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching buses' });
  }
});

// ─── POST /api/buses — admin/manager only ───────────────────────
router.post(
  '/',
  protect,
  authorize(...MANAGE_ROLES),
  busValidationRules(false),
  handleValidation,
  async (req, res) => {
    try {
      const existing = await Bus.findOne({ busNumber: req.body.busNumber.trim().toUpperCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A bus with this bus number already exists',
        });
      }

      const bus = await Bus.create({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({ success: true, message: 'Bus created successfully', bus });
    } catch (error) {
      console.error('Create bus error:', error);
      if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0]?.message || 'Validation error';
        return res.status(400).json({ success: false, message });
      }
      res.status(500).json({ success: false, message: 'Server error while creating bus' });
    }
  }
);

// ─── PUT /api/buses/:id — admin/manager only ────────────────────
router.put(
  '/:id',
  protect,
  authorize(...MANAGE_ROLES),
  busValidationRules(true),
  handleValidation,
  async (req, res) => {
    try {
      const bus = await Bus.findById(req.params.id);
      if (!bus) {
        return res.status(404).json({ success: false, message: 'Bus not found' });
      }

      if (req.body.busNumber && req.body.busNumber.trim().toUpperCase() !== bus.busNumber) {
        const duplicate = await Bus.findOne({ busNumber: req.body.busNumber.trim().toUpperCase() });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: 'A bus with this bus number already exists',
          });
        }
      }

      const totalSeats = req.body.totalSeats !== undefined ? Number(req.body.totalSeats) : bus.totalSeats;
      const availableSeats = req.body.availableSeats !== undefined ? Number(req.body.availableSeats) : bus.availableSeats;
      if (availableSeats > totalSeats) {
        return res.status(400).json({
          success: false,
          message: 'Available seats cannot exceed total seats',
        });
      }

      Object.assign(bus, req.body);
      await bus.save();

      res.status(200).json({ success: true, message: 'Bus updated successfully', bus });
    } catch (error) {
      console.error('Update bus error:', error);
      if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0]?.message || 'Validation error';
        return res.status(400).json({ success: false, message });
      }
      res.status(500).json({ success: false, message: 'Server error while updating bus' });
    }
  }
);

// ─── DELETE /api/buses/:id — admin/manager only ─────────────────
router.delete('/:id', protect, authorize(...MANAGE_ROLES), async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.status(200).json({ success: true, message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting bus' });
  }
});

module.exports = router;
