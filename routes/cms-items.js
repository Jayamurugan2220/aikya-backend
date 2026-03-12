import express from 'express';
import { 
  News,
  Projects,
  Services,
  Testimonials,
  SpecialOffers,
  CSR,
  Events,
  Careers,
  Leadership,
  FooterItems
} from '../models/Content.js';
import {
  ProjectItem,
  TestimonialItem,
  SpecialOfferItem,
  LeadershipItem,
  WhyChooseItem,
  LocationCardItem,
  FooterItem,
  NewsArticle,
  ServiceItem,
  CSRItem,
  EventItem,
  CareerItem,
} from '../models/CMSItems.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { updateItemWithImageCleanup, deleteItemWithImageCleanup } from '../utils/imageCleanup.js';

const router = express.Router();

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// ===== NEWS/BLOG ARTICLES =====

// Get all articles with filters
router.get('/news/articles', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    // Build query
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Get articles from NewsArticle collection
    const articles = await NewsArticle.find(query).sort({ publishedDate: -1, createdAt: -1 });
    
    // Get unique categories
    const allArticles = await NewsArticle.find();
    const categories = [...new Set(allArticles.map(a => a.category).filter(Boolean))];
    
    res.json({ 
      success: true, 
      data: articles,
      categories,
      stats: {
        total: allArticles.length,
        published: allArticles.filter(a => a.status === 'published').length,
        draft: allArticles.filter(a => a.status === 'draft').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single article
router.get('/news/articles/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new article
router.post('/news/articles', verifyAdmin, async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user?.username || req.body.author || 'Admin',
      publishedDate: req.body.status === 'published' ? new Date() : null
    };

    const newArticle = await NewsArticle.create(articleData);

    res.json({ 
      success: true, 
      data: newArticle, 
      message: 'Article created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update article
router.put('/news/articles/:id', verifyAdmin, async (req, res) => {
  try {
    // Find existing article to check publishedDate
    const existingArticle = await NewsArticle.findById(req.params.id);
    
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };

    // Update published date if status changed to published and not already set
    if (req.body.status === 'published' && !existingArticle?.publishedDate) {
      updateData.publishedDate = new Date();
    }

    // Update with automatic image cleanup
    const result = await updateItemWithImageCleanup('news', req.params.id, updateData);

    res.json({ 
      success: true, 
      data: result.item, 
      cleanup: result.cleanup,
      message: 'Article updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete article
router.delete('/news/articles/:id', verifyAdmin, async (req, res) => {
  try {
    // Delete with automatic image cleanup
    const result = await deleteItemWithImageCleanup('news', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Article deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== PROJECTS =====

// Get all projects with filters
router.get('/projects/items', async (req, res) => {
  try {
    const { category, status, location, area, search } = req.query;
    
    let query = {};
    
    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Location filter (e.g., chennai, tirunelveli)
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Area filter (for Chennai subdivisions)
    if (area && area !== 'all') {
      query.area = area;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await ProjectItem.find(query).sort({ createdAt: -1 });
    const allProjects = await ProjectItem.find();
    const categories = [...new Set(allProjects.map(p => p.category).filter(Boolean))];
    
    res.json({ 
      success: true, 
      data: items,
      categories,
      stats: {
        total: allProjects.length,
        ongoing: allProjects.filter(p => p.status === 'ongoing').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        upcoming: allProjects.filter(p => p.status === 'upcoming').length,
        chennai: allProjects.filter(p => p.location?.toLowerCase().includes('chennai')).length,
        withArea: allProjects.filter(p => p.area).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single project
router.get('/projects/items/:id', async (req, res) => {
  try {
    const project = await ProjectItem.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new project
router.post('/projects/items', verifyAdmin, async (req, res) => {
  try {
    const newProject = await ProjectItem.create(req.body);

    res.json({ 
      success: true, 
      data: newProject, 
      message: 'Project created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project
router.put('/projects/items/:id', verifyAdmin, async (req, res) => {
  try {
    // Update with automatic image cleanup
    const result = await updateItemWithImageCleanup('projects', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Project updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project
router.delete('/projects/items/:id', verifyAdmin, async (req, res) => {
  try {
    // Delete with automatic image cleanup
    const result = await deleteItemWithImageCleanup('projects', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Project deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== SERVICES =====

// Get all services with filters
router.get('/services/items', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Build query
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get items from ServiceItem collection
    const items = await ServiceItem.find(query).sort({ createdAt: -1 });
    
    // Get unique categories
    const allItems = await ServiceItem.find();
    const categories = [...new Set(allItems.map(s => s.category).filter(Boolean))];
    
    res.json({ 
      success: true, 
      data: items,
      categories,
      stats: {
        total: await ServiceItem.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new service
router.post('/services/items', verifyAdmin, async (req, res) => {
  try {
    const newService = await ServiceItem.create(req.body);

    res.json({ 
      success: true, 
      data: newService, 
      message: 'Service created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update service
router.put('/services/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('services', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Service updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete service
router.delete('/services/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('services', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Service deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== TESTIMONIALS =====

router.get('/testimonials/items', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await TestimonialItem.find(query).sort({ createdAt: -1 });
    const allTestimonials = await TestimonialItem.find();
    const avgRating = allTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / (allTestimonials.length || 1);
    
    res.json({ 
      success: true, 
      data: items,
      stats: {
        total: allTestimonials.length,
        averageRating: avgRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/testimonials/items', verifyAdmin, async (req, res) => {
  try {
    const newTestimonial = await TestimonialItem.create(req.body);

    res.json({ 
      success: true, 
      data: newTestimonial, 
      message: 'Testimonial created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/testimonials/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('testimonials', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Testimonial updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/testimonials/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('testimonials', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Testimonial deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== SPECIAL OFFERS =====

router.get('/special-offers/items', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await SpecialOfferItem.find(query).sort({ createdAt: -1 });
    const allOffers = await SpecialOfferItem.find();
    res.json({ 
      success: true, 
      data: items,
      stats: {
        total: allOffers.length,
        active: allOffers.filter(offer => offer.status === 'active').length,
        expired: allOffers.filter(offer => offer.status === 'expired').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Also support alternative URL format
router.get('/specialoffers/items', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await SpecialOfferItem.find(query).sort({ createdAt: -1 });
    const allOffers = await SpecialOfferItem.find();
    res.json({ 
      success: true, 
      data: items,
      stats: {
        total: allOffers.length,
        active: allOffers.filter(offer => offer.status === 'active').length,
        expired: allOffers.filter(offer => offer.status === 'expired').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/special-offers/items', verifyAdmin, async (req, res) => {
  try {
    const newOffer = await SpecialOfferItem.create(req.body);

    res.json({ 
      success: true, 
      data: newOffer, 
      message: 'Special offer created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/special-offers/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('special-offers', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Special offer updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/special-offers/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('special-offers', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Special offer deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== FOOTER ITEMS =====

router.get('/footer/items', async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { label: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await FooterItem.find(query).sort({ order: 1 });
    const allItems = await FooterItem.find();
    res.json({ 
      success: true, 
      data: items,
      stats: {
        total: allItems.length,
        byType: {
          contact: allItems.filter(item => item.type === 'contact').length,
          link: allItems.filter(item => item.type === 'link').length,
          social: allItems.filter(item => item.type === 'social').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/footer/items', verifyAdmin, async (req, res) => {
  try {
    const newItem = await FooterItem.create(req.body);

    res.json({ success: true, data: newItem, message: 'Footer item created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/footer/items/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedItem = await FooterItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Footer item not found' });
    }

    res.json({ success: true, data: updatedItem, message: 'Footer item updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/footer/items/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await FooterItem.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Footer item not found' });
    }

    res.json({ success: true, message: 'Footer item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== CSR INITIATIVES =====

router.get('/csr/initiatives', async (req, res) => {
  try {
    // Get items from CSRItem collection
    const items = await CSRItem.find().sort({ date: -1, createdAt: -1 });

    res.json({ 
      success: true, 
      data: items,
      stats: { total: await CSRItem.countDocuments() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/csr/initiatives', verifyAdmin, async (req, res) => {
  try {
    const newInitiative = await CSRItem.create(req.body);

    res.json({ success: true, data: newInitiative, message: 'Initiative created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/csr/initiatives/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('csr', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Initiative updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/csr/initiatives/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('csr', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Initiative deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== EVENTS =====

router.get('/events/items', async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get items from EventItem collection
    const items = await EventItem.find(query).sort({ date: -1, createdAt: -1 });
    
    // Get stats
    const allEvents = await EventItem.find();
    
    res.json({ 
      success: true, 
      data: items,
      stats: {
        total: allEvents.length,
        upcoming: allEvents.filter(e => e.status === 'upcoming').length,
        completed: allEvents.filter(e => e.status === 'completed').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/events/items', verifyAdmin, async (req, res) => {
  try {
    const newEvent = await EventItem.create(req.body);

    res.json({ success: true, data: newEvent, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/events/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('events', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Event updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/events/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('events', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Event deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== CAREERS/JOB POSITIONS =====

router.get('/careers/positions', async (req, res) => {
  try {
    const { department, type } = req.query;
    
    // Build query
    let query = {};
    if (department && department !== 'all') {
      query.department = department;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get items from CareerItem collection
    const items = await CareerItem.find(query).sort({ createdAt: -1 });
    
    // Get unique departments
    const allItems = await CareerItem.find();
    const departments = [...new Set(allItems.map(p => p.department).filter(Boolean))];
    
    res.json({ 
      success: true, 
      data: items,
      departments,
      stats: { total: await CareerItem.countDocuments() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/careers/positions', verifyAdmin, async (req, res) => {
  try {
    const newPosition = await CareerItem.create(req.body);

    res.json({ success: true, data: newPosition, message: 'Position created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/careers/positions/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('careers', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Position updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/careers/positions/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('careers', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Position deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LEADERSHIP TEAM =====

router.get('/leadership/members', async (req, res) => {
  try {
    let leadership = await Leadership.findOne();
    if (!leadership) {
      leadership = await Leadership.create({ team: [] });
    }

    res.json({ 
      success: true, 
      data: leadership.team || [],
      stats: { total: (leadership.team || []).length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leadership/members', verifyAdmin, async (req, res) => {
  try {
    let leadership = await Leadership.findOne();
    if (!leadership) {
      leadership = await Leadership.create({ team: [] });
    }

    const newMember = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body
    };

    leadership.team.push(newMember);
    leadership.updatedAt = Date.now();
    await leadership.save();

    res.json({ success: true, data: newMember, message: 'Team member created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leadership/members/:id', verifyAdmin, async (req, res) => {
  try {
    const leadership = await Leadership.findOne();
    const member = leadership.team.id(req.params.id);
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id') member[key] = req.body[key];
    });

    leadership.updatedAt = Date.now();
    await leadership.save();

    res.json({ success: true, data: member, message: 'Team member updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/leadership/members/:id', verifyAdmin, async (req, res) => {
  try {
    const leadership = await Leadership.findOne();
    leadership.team.id(req.params.id).deleteOne();
    leadership.updatedAt = Date.now();
    await leadership.save();

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LEADERSHIP (NEW - FROM MEMORY STORE) =====

router.get('/leadership/items', async (req, res) => {
  try {
    const leaders = await LeadershipItem.find().sort({ order: 1 });
    res.json({ 
      success: true, 
      data: leaders,
      stats: { total: leaders.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leadership/items', verifyAdmin, async (req, res) => {
  try {
    const newLeader = await LeadershipItem.create(req.body);
    res.json({ success: true, data: newLeader, message: 'Leader created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leadership/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('leadership', req.params.id, req.body);

    res.json({ 
      success: true, 
      data: result.item,
      cleanup: result.cleanup,
      message: 'Leader updated successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} old image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/leadership/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('leadership', req.params.id);

    res.json({ 
      success: true,
      cleanup: result.cleanup,
      message: 'Leader deleted successfully' + 
        (result.cleanup.deletedCount > 0 ? ` (${result.cleanup.deletedCount} image(s) removed from cloud)` : '')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== WHY CHOOSE US =====

router.get('/why-choose/items', async (req, res) => {
  try {
    const reasons = await WhyChooseItem.find().sort({ order: 1 });
    res.json({ 
      success: true, 
      data: reasons,
      stats: { total: reasons.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/why-choose/items', verifyAdmin, async (req, res) => {
  try {
    const newReason = await WhyChooseItem.create(req.body);
    res.json({ success: true, data: newReason, message: 'Reason created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/why-choose/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('why-choose', req.params.id, {
      ...req.body,
      updatedAt: Date.now()
    });
    
    if (result.item) {
      const message = result.cleanup.deletedCount > 0 
        ? `Reason updated successfully (${result.cleanup.deletedCount} old image(s) removed from cloud)`
        : 'Reason updated successfully';
      res.json({ 
        success: true, 
        data: result.item, 
        cleanup: result.cleanup,
        message 
      });
    } else {
      res.status(404).json({ success: false, message: 'Reason not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/why-choose/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('why-choose', req.params.id);
    
    if (result.deletedCount > 0) {
      const message = result.cleanup.deletedCount > 0
        ? `Reason deleted successfully (${result.cleanup.deletedCount} image(s) removed from cloud)`
        : 'Reason deleted successfully';
      res.json({ 
        success: true, 
        cleanup: result.cleanup,
        message 
      });
    } else {
      res.status(404).json({ success: false, message: 'Reason not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LOCATION CARDS =====

router.get('/location-cards/items', async (req, res) => {
  try {
    const locations = await LocationCardItem.find().sort({ order: 1 });
    res.json({ 
      success: true, 
      data: locations,
      stats: { 
        total: locations.length,
        totalProjects: locations.reduce((sum, loc) => sum + (loc.projectCount || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/location-cards/items', verifyAdmin, async (req, res) => {
  try {
    const newLocation = await LocationCardItem.create(req.body);
    res.json({ success: true, data: newLocation, message: 'Location created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/location-cards/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await updateItemWithImageCleanup('location-cards', req.params.id, {
      ...req.body,
      updatedAt: Date.now()
    });
    
    if (result.item) {
      const message = result.cleanup.deletedCount > 0 
        ? `Location updated successfully (${result.cleanup.deletedCount} old image(s) removed from cloud)`
        : 'Location updated successfully';
      res.json({ 
        success: true, 
        data: result.item, 
        cleanup: result.cleanup,
        message 
      });
    } else {
      res.status(404).json({ success: false, message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/location-cards/items/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await deleteItemWithImageCleanup('location-cards', req.params.id);
    
    if (result.deletedCount > 0) {
      const message = result.cleanup.deletedCount > 0
        ? `Location deleted successfully (${result.cleanup.deletedCount} image(s) removed from cloud)`
        : 'Location deleted successfully';
      res.json({ 
        success: true, 
        cleanup: result.cleanup,
        message 
      });
    } else {
      res.status(404).json({ success: false, message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
