import { Request, Response } from 'express'
import Category from '../models/Category'
import { handleAsync } from '../utils/handleAsync'

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = handleAsync(async (req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 })
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  })
})

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = handleAsync(async (req: Request, res: Response) => {
  const category = await Category.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  })

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    })
  }

  res.status(200).json({
    success: true,
    data: category
  })
})

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = handleAsync(async (req: Request, res: Response) => {
  const category = await Category.create(req.body)

  res.status(201).json({
    success: true,
    data: category
  })
})

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = handleAsync(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    })
  }

  res.status(200).json({
    success: true,
    data: category
  })
})

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = handleAsync(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    })
  }

  await category.deleteOne()

  res.status(200).json({
    success: true,
    data: {}
  })
})
