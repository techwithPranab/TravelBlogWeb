import { Request, Response } from 'express';
import Contact from '../models/Contact';

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create new contact
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
  } catch (error: any) {
    console.error('Contact creation error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A contact message with this information already exists.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save contact message. Please try again.'
    });
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
      success: true,
      data: {
        contacts,
        currentPage: page,
        totalPages,
        total
      }
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
      return res.status(404).json({ 
        success: false, 
        error: 'Contact message not found.' 
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch contact message.' 
    });
  }
};

export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status provided.' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contact message not found.' 
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to update contact status.' 
    });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contact message not found.' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: { message: 'Contact message deleted successfully.' }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete contact message.' 
    });
  }
};
