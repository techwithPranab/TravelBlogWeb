import { Router } from 'express';
import { body } from 'express-validator';
import {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from '../controllers/contactController';
import { requireAdmin } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation rules for contact form
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Public route for creating contact messages
router.post('/', contactValidation, validate, createContact);

// Admin routes for managing contact messages (protected)
router.get('/', requireAdmin, getContacts);
router.get('/:id', requireAdmin, getContactById);
router.put('/:id/status', requireAdmin, updateContactStatus);
router.delete('/:id', requireAdmin, deleteContact);

export default router;
