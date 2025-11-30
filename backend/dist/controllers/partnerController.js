"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerStats = exports.deletePartner = exports.updatePartnerStatus = exports.getPartnerById = exports.getPartners = exports.createPartner = void 0;
const Partner_1 = __importDefault(require("../models/Partner"));
const createPartner = async (req, res) => {
    try {
        const { firstName, lastName, email, company, partnershipType, message } = req.body;
        console.log('Creating partner:', req.body);
        const partner = new Partner_1.default({
            firstName,
            lastName,
            email,
            company,
            partnershipType,
            message
        });
        await partner.save();
        res.status(201).json({
            message: 'Partnership proposal submitted successfully.',
            partner: {
                id: partner._id,
                firstName: partner.firstName,
                lastName: partner.lastName,
                email: partner.email,
                company: partner.company,
                partnershipType: partner.partnershipType,
                status: partner.status,
                createdAt: partner.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ error: 'Failed to submit partnership proposal.' });
    }
};
exports.createPartner = createPartner;
const getPartners = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, partnershipType, search } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (partnershipType) {
            query.partnershipType = partnershipType;
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }
        const partners = await Partner_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .select('-__v');
        const total = await Partner_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            data: {
                partners,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalPartners: total,
                    hasNextPage: pageNum * limitNum < total,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Failed to fetch partnership proposals.' });
    }
};
exports.getPartners = getPartners;
const getPartnerById = async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner_1.default.findById(id);
        if (!partner) {
            return res.status(404).json({
                success: false,
                error: 'Partnership proposal not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: partner
        });
    }
    catch (error) {
        console.error('Error fetching partner:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch partnership proposal.'
        });
    }
};
exports.getPartnerById = getPartnerById;
const updatePartnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const validStatuses = ['pending', 'reviewed', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value.'
            });
        }
        const updateData = {
            status,
            reviewedAt: new Date(),
            reviewedBy: 'admin'
        };
        if (adminNotes !== undefined) {
            updateData.adminNotes = adminNotes;
        }
        const partner = await Partner_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!partner) {
            return res.status(404).json({
                success: false,
                error: 'Partnership proposal not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: partner,
            message: 'Partnership proposal updated successfully.'
        });
    }
    catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update partnership proposal.'
        });
    }
};
exports.updatePartnerStatus = updatePartnerStatus;
const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner_1.default.findByIdAndDelete(id);
        if (!partner) {
            return res.status(404).json({
                success: false,
                error: 'Partnership proposal not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: { message: 'Partnership proposal deleted successfully.' }
        });
    }
    catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete partnership proposal.'
        });
    }
};
exports.deletePartner = deletePartner;
const getPartnerStats = async (req, res) => {
    try {
        const stats = await Partner_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const totalPartners = await Partner_1.default.countDocuments();
        const pendingPartners = await Partner_1.default.countDocuments({ status: 'pending' });
        const recentPartners = await Partner_1.default.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });
        res.status(200).json({
            success: true,
            data: {
                total: totalPartners,
                pending: pendingPartners,
                recent: recentPartners,
                byStatus: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            }
        });
    }
    catch (error) {
        console.error('Error fetching partner stats:', error);
        res.status(500).json({ error: 'Failed to fetch partnership statistics.' });
    }
};
exports.getPartnerStats = getPartnerStats;
