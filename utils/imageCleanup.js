import { deleteFromStorage } from '../config/storage.js';
import {
  ProjectItem,
  TestimonialItem,
  SpecialOfferItem,
  LeadershipItem,
  WhyChooseItem,
  LocationCardItem,
  NewsArticle,
  ServiceItem,
  CSRItem,
  EventItem,
  CareerItem,
} from '../models/CMSItems.js';

/**
 * Handle image updates - detects changes and cleans up old images
 * @param {Object} existingData - Current document data
 * @param {Object} newData - New data being submitted
 * @param {string|Array} imageFields - Field name(s) containing image URLs (e.g., 'image' or ['image', 'images'])
 * @returns {Promise<Object>} - Object with cleanup results
 */
export const handleImageUpdate = async (existingData, newData, imageFields) => {
  const fieldsArray = Array.isArray(imageFields) ? imageFields : [imageFields];
  const deletedImages = [];
  const errors = [];

  for (const field of fieldsArray) {
    const oldValue = existingData[field];
    const newValue = newData[field];

    // Skip if field doesn't exist or hasn't changed
    if (!oldValue || !newValue) continue;

    // Handle single image field
    if (typeof oldValue === 'string' && typeof newValue === 'string') {
      if (oldValue !== newValue && oldValue.includes('/api/images/')) {
        try {
          const deleted = await deleteFromStorage(oldValue);
          if (deleted) {
            deletedImages.push(oldValue);
          }
        } catch (error) {
          errors.push({ field, url: oldValue, error: error.message });
        }
      }
    }

    // Handle array of images
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const removedImages = oldValue.filter(url => !newValue.includes(url));
      for (const url of removedImages) {
        if (url.includes('/api/images/')) {
          try {
            const deleted = await deleteFromStorage(url);
            if (deleted) {
              deletedImages.push(url);
            }
          } catch (error) {
            errors.push({ field, url, error: error.message });
          }
        }
      }
    }
  }

  return {
    deletedCount: deletedImages.length,
    deletedImages,
    errors,
  };
};

/**
 * Delete image when item is deleted
 * @param {Object} data - Document data
 * @param {string|Array} imageFields - Field name(s) containing image URLs
 * @returns {Promise<Object>}
 */
export const deleteItemImages = async (data, imageFields) => {
  const fieldsArray = Array.isArray(imageFields) ? imageFields : [imageFields];
  const deletedImages = [];
  const errors = [];

  for (const field of fieldsArray) {
    const value = data[field];
    if (!value) continue;

    // Handle single image
    if (typeof value === 'string' && value.includes('/api/images/')) {
      try {
        const deleted = await deleteFromStorage(value);
        if (deleted) {
          deletedImages.push(value);
        }
      } catch (error) {
        errors.push({ field, url: value, error: error.message });
      }
    }

    // Handle array of images
    if (Array.isArray(value)) {
      for (const url of value) {
        if (url.includes('/api/images/')) {
          try {
            const deleted = await deleteFromStorage(url);
            if (deleted) {
              deletedImages.push(url);
            }
          } catch (error) {
            errors.push({ field, url, error: error.message });
          }
        }
      }
    }
  }

  return {
    deletedCount: deletedImages.length,
    deletedImages,
    errors,
  };
};

/**
 * Get model and image fields based on collection type
 * @param {string} collectionType
 * @returns {Object} - { model, imageFields }
 */
export const getCollectionConfig = (collectionType) => {
  const configs = {
    projects: {
      model: ProjectItem,
      imageFields: ['image', 'images'],
    },
    testimonials: {
      model: TestimonialItem,
      imageFields: 'image',
    },
    'special-offers': {
      model: SpecialOfferItem,
      imageFields: 'image',
    },
    leadership: {
      model: LeadershipItem,
      imageFields: 'image',
    },
    'why-choose': {
      model: WhyChooseItem,
      imageFields: 'icon',
    },
    'location-cards': {
      model: LocationCardItem,
      imageFields: 'image',
    },
    news: {
      model: NewsArticle,
      imageFields: ['featuredImage', 'image'],
    },
    services: {
      model: ServiceItem,
      imageFields: 'image',
    },
    csr: {
      model: CSRItem,
      imageFields: ['image', 'images'],
    },
    events: {
      model: EventItem,
      imageFields: ['image', 'images'],
    },
    careers: {
      model: CareerItem,
      imageFields: 'image',
    },
  };

  return configs[collectionType] || { model: null, imageFields: null };
};

/**
 * Update item with automatic image cleanup
 * @param {string} collectionType - Type of collection (projects, news, etc.)
 * @param {string} itemId - ID of the item to update
 * @param {Object} updateData - New data
 * @returns {Promise<Object>} - Updated item and cleanup results
 */
export const updateItemWithImageCleanup = async (collectionType, itemId, updateData) => {
  const { model: Model, imageFields } = getCollectionConfig(collectionType);

  if (!Model) {
    throw new Error(`Unknown collection type: ${collectionType}`);
  }

  // Get existing item
  const existingItem = await Model.findById(itemId);
  if (!existingItem) {
    throw new Error('Item not found');
  }

  // Handle image cleanup
  const cleanupResult = await handleImageUpdate(existingItem, updateData, imageFields);

  // Update the item
  const updatedItem = await Model.findByIdAndUpdate(
    itemId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  return {
    item: updatedItem,
    cleanup: cleanupResult,
  };
};

/**
 * Delete item with automatic image cleanup
 * @param {string} collectionType - Type of collection
 * @param {string} itemId - ID of the item to delete
 * @returns {Promise<Object>} - Deleted item and cleanup results
 */
export const deleteItemWithImageCleanup = async (collectionType, itemId) => {
  const { model: Model, imageFields } = getCollectionConfig(collectionType);

  if (!Model) {
    throw new Error(`Unknown collection type: ${collectionType}`);
  }

  // Get the item before deletion
  const item = await Model.findById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }

  // Delete images from storage
  const cleanupResult = await deleteItemImages(item, imageFields);

  // Delete the item from database
  await Model.findByIdAndDelete(itemId);

  return {
    item,
    cleanup: cleanupResult,
  };
};

export default {
  handleImageUpdate,
  deleteItemImages,
  getCollectionConfig,
  updateItemWithImageCleanup,
  deleteItemWithImageCleanup,
};
