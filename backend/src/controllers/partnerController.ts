import { Request, Response } from 'express'
import Partner from '../models/Partner'

export const createPartner = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, company, partnershipType, message } = req.body
    console.log('Creating partner:', req.body)
    const partner = new Partner({
      firstName,
      lastName,
      email,
      company,
      partnershipType,
      message
    })

    await partner.save()
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
    })
  } catch (error) {
    console.error('Error creating partner:', error)
    res.status(500).json({ error: 'Failed to submit partnership proposal.' })
  }
}

export const getPartners = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, partnershipType, search } = req.query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10

    const query: any = {}

    if (status) {
      query.status = status
    }

    if (partnershipType) {
      query.partnershipType = partnershipType
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ]
    }

    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .select('-__v')

    const total = await Partner.countDocuments(query)

    res.status(200).json({
      partners,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalPartners: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    res.status(500).json({ error: 'Failed to fetch partnership proposals.' })
  }
}

export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const partner = await Partner.findById(id)

    if (!partner) {
      return res.status(404).json({ error: 'Partnership proposal not found.' })
    }

    res.status(200).json(partner)
  } catch (error) {
    console.error('Error fetching partner:', error)
    res.status(500).json({ error: 'Failed to fetch partnership proposal.' })
  }
}

export const updatePartnerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body

    const validStatuses = ['pending', 'reviewed', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' })
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: 'admin'
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!partner) {
      return res.status(404).json({ error: 'Partnership proposal not found.' })
    }

    res.status(200).json({
      message: 'Partnership proposal updated successfully.',
      partner
    })
  } catch (error) {
    console.error('Error updating partner:', error)
    res.status(500).json({ error: 'Failed to update partnership proposal.' })
  }
}

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const partner = await Partner.findByIdAndDelete(id)

    if (!partner) {
      return res.status(404).json({ error: 'Partnership proposal not found.' })
    }

    res.status(200).json({ message: 'Partnership proposal deleted successfully.' })
  } catch (error) {
    console.error('Error deleting partner:', error)
    res.status(500).json({ error: 'Failed to delete partnership proposal.' })
  }
}

export const getPartnerStats = async (req: Request, res: Response) => {
  try {
    const stats = await Partner.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const totalPartners = await Partner.countDocuments()
    const pendingPartners = await Partner.countDocuments({ status: 'pending' })
    const recentPartners = await Partner.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })

    res.status(200).json({
      total: totalPartners,
      pending: pendingPartners,
      recent: recentPartners,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {})
    })
  } catch (error) {
    console.error('Error fetching partner stats:', error)
    res.status(500).json({ error: 'Failed to fetch partnership statistics.' })
  }
}
