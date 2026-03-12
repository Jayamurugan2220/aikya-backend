import mongoose from 'mongoose';

// Individual Project Item Schema
const projectItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: String,
  area: String, // Chennai subdivision area (tambaram, perugalathur, hastinapuram, gudavancherry, chithlapakam)
  description: String,
  category: {
    type: String,
    enum: ['residential', 'commercial', 'infrastructure'],
  },
  type: {
    type: String,
    enum: ['apartment', 'villa', 'office', 'plots', 'retail'],
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'upcoming'],
    default: 'ongoing',
  },
  amenities: [String],
  image: String,
  images: [String],
  link: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Testimonial Item Schema
const testimonialItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: String,
  company: String,
  content: {
    type: String,
    required: true,
  },
  image: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  location: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Special Offer Item Schema
const specialOfferItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: String,
  discount: String,
  features: [String],
  image: String,
  location: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
  },
  validUntil: Date,
  contactPhone: String,
  contactEmail: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Leadership Item Schema
const leadershipItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: String, // Position/Title
  initial: String, // Single letter initial
  bio: String,
  image: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Why Choose Us Item Schema
const whyChooseItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: String,
  icon: String, // Icon name (Clock, Shield, etc.)
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Location Card Item Schema
const locationCardItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  projectCount: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Footer Item Schema
const footerItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['phone', 'email', 'address', 'social', 'link'],
  },
  label: String,
  value: String,
  icon: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual News Article Schema
const newsArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  excerpt: String,
  content: String,
  image: String,
  author: String,
  category: String,
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Service Item Schema
const serviceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  features: [{
    title: String,
    description: String,
  }],
  icon: String,
  image: String,
  images: [String],
  category: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual CSR Initiative Schema
const csrItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  location: String,
  category: String,
  impact: String,
  date: Date,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Event Item Schema
const eventItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  date: Date,
  location: String,
  category: String,
  registrationLink: String,
  time: String,
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Individual Career/Job Opening Schema
const careerItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: String,
  location: String,
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
  },
  experience: String,
  salary: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  applyLink: String,
  image: String,
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export models
const ProjectItem = mongoose.model('ProjectItem', projectItemSchema, 'projects');
const TestimonialItem = mongoose.model('TestimonialItem', testimonialItemSchema, 'testimonials');
const SpecialOfferItem = mongoose.model('SpecialOfferItem', specialOfferItemSchema, 'specialoffers');
const LeadershipItem = mongoose.model('LeadershipItem', leadershipItemSchema, 'leadership');
const WhyChooseItem = mongoose.model('WhyChooseItem', whyChooseItemSchema, 'whychoose');
const LocationCardItem = mongoose.model('LocationCardItem', locationCardItemSchema, 'locationcards');
const FooterItem = mongoose.model('FooterItem', footerItemSchema, 'footer');
const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema, 'news');
const ServiceItem = mongoose.model('ServiceItem', serviceItemSchema, 'services');
const CSRItem = mongoose.model('CSRItem', csrItemSchema, 'csr');
const EventItem = mongoose.model('EventItem', eventItemSchema, 'events');
const CareerItem = mongoose.model('CareerItem', careerItemSchema, 'careers');

export {
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
};
