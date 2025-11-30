"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContactStatus = exports.getContactById = exports.getContacts = exports.createContact = void 0;
const Contact_1 = __importDefault(require("../models/Contact"));
const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        // Create new contact
        const contact = new Contact_1.default({
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
    }
    catch (error) {
        console.error('Contact creation error:', error);
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
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
exports.createContact = createContact;
const getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const status = req.query.status;
        let query = {};
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
        const total = await Contact_1.default.countDocuments(query);
        const contacts = await Contact_1.default.find(query)
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch contact messages.' });
    }
};
exports.getContacts = getContacts;
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact_1.default.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact message.'
        });
    }
};
exports.getContactById = getContactById;
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status provided.'
            });
        }
        const contact = await Contact_1.default.findByIdAndUpdate(id, { status }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update contact status.'
        });
    }
};
exports.updateContactStatus = updateContactStatus;
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete contact message.'
        });
    }
};
exports.deleteContact = deleteContact;
