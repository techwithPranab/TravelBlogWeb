import { Router } from 'express';
import { 
  createContact, 
  getContacts, 
  getContactById, 
  updateContactStatus, 
  deleteContact 
} from '../controllers/contactController';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Public route for creating contact messages
router.post('/', createContact);

// Admin routes for managing contact messages (protected)
router.get('/', requireAdmin, getContacts);
router.get('/:id', requireAdmin, getContactById);
router.put('/:id/status', requireAdmin, updateContactStatus);
router.delete('/:id', requireAdmin, deleteContact);

export default router;
