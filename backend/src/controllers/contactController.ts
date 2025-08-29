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
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages.' });
  }
};
