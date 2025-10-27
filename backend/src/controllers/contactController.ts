import { Request, Response } from 'express';
import Contact from '../models/Contact';

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: 'Contact message saved successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact message.' });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    let query: any = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      contacts,
      currentPage: page,
      totalPages,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages.' });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found.' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact message.' });
  }
};

export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found.' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact status.' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found.' });
    }

    res.status(200).json({ message: 'Contact message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact message.' });
  }
};
