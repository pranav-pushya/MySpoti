import { Router, Request, Response } from 'express';
import { getCategoriesWithCount, getCategoryByName, createCategory } from '../db.js';

const router = Router();

// GET /api/categories - List all categories with track counts
router.get('/', (req: Request, res: Response) => {
  try {
    const categories = getCategoriesWithCount();
    res.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        icon: cat.icon,
        trackCount: cat.track_count,
        createdAt: cat.created_at
      }))
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create a new custom category
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existing = getCategoryByName(trimmedName);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists',
        category: existing
      });
    }

    const newCategory = createCategory(trimmedName, color, icon);
    res.status(201).json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        color: newCategory.color,
        icon: newCategory.icon,
        trackCount: 0,
        createdAt: newCategory.created_at
      }
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

export default router;
