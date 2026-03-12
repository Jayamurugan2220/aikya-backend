import mongoose from 'mongoose';

// Hero Section Schema
const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Achieve Measurable Growth through AI-Driven Insights and Data-Backed Strategies',
  },
  subtitle: {
    type: String,
    required: true,
    default: 'by Aikya Builders',
  },
  tagline: {
    type: String,
    default: 'Pioneering Data Solutions',
  },
  buttonText: {
    type: String,
    default: 'Latest News',
  },
  buttonLink: {
    type: String,
    default: '#news',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// About Section Schema
const aboutSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    default: 'Discover Our Foundation',
  },
  content: {
    type: String,
    required: true,
    default: 'At the heart of Aikya Builders is a commitment to transforming complex data challenges into clear, actionable insights. Founded on the principles of innovation and expertise, we strive to be more than just a service provider – we are your trusted partner in navigating the world of big data and artificial intelligence.',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Why Choose Section Schema
const whyChooseSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    default: 'Why Choose Us',
  },
  reasons: [{
    icon: String,
    title: String,
    description: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Contact Section Schema
const contactSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: "Let's Build",
  },
  headingHighlight: {
    type: String,
    default: 'Together',
  },
  description: {
    type: String,
    default: "Ready to transform your dreams into reality? Partner with India's leading real estate developer.",
  },
  companyName: {
    type: String,
    default: 'AIKYA BUILDERS PVT LTD',
  },
  address: {
    type: String,
    default: 'No 251, TNHB Colony, Tambaram Sanatorium, Chennai - 600 047',
  },
  contactPersons: {
    type: String,
    default: 'B. GOPALAKRISHNAN / M B FURHAN SIDDIQ',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  email: {
    type: String,
    default: 'aikyabuilders@gmail.com',
  },
  mapCoordinates: {
    type: String,
    default: '12.92,80.12',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Leadership Section Schema
const leadershipSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Our Leadership Team',
  },
  leaders: [{
    name: String,
    role: String,
    bio: String,
    image: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Projects Section Schema
const projectsSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Our Projects',
  },
  description: {
    type: String,
    default: 'Explore our portfolio of innovative solutions',
  },
  items: [{
    name: String, // Changed from title to name
    location: String, // Added location field
    description: String,
    category: String,
    type: String, // Added type field
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'upcoming'],
      default: 'ongoing'
    }, // Added status field
    image: String,
    amenities: [String], // Added amenities array
    link: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Testimonials Section Schema
const testimonialsSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'What Our Clients Say',
  },
  subheading: {
    type: String,
    default: 'we create spaces that transform lives and possibilities',
  },
  description: {
    type: String,
    default: 'Our clients are at the heart of everything we do.',
  },
  testimonials: [{
    name: String,
    role: String,
    company: String,
    content: String,
    image: String,
    rating: Number,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Special Offers Section Schema
const specialOffersSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Special Offers',
  },
  subheading: String,
  offers: [{
    title: String,
    description: String,
    price: String,
    discount: String,
    features: [String],
    image: String,
    location: String,
    status: String,
    contactPhone: String,
    contactEmail: String,
    validTill: Date,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Services Section Schema
const servicesSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Our Services',
  },
  subheading: String,
  description: String,
  services: [{
    title: String,
    description: String,
    features: [{
      title: String,
      description: String
    }],
    icon: String,
    image: String,
    images: [String],
    category: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// News Section Schema
const newsSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Latest News',
  },
  description: String,
  articles: [{
    title: String,
    excerpt: String,
    content: String,
    image: String,
    author: String,
    publishedDate: Date,
    category: String,
    tags: [String],
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// CSR Section Schema
const csrSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Corporate Social Responsibility',
  },
  description: String,
  whyWeCare: {
    heading: String,
    content: String,
  },
  initiatives: [{
    title: String,
    description: String,
    image: String,
    category: String,
    impact: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Events Section Schema
const eventsSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Events',
  },
  description: String,
  events: [{
    title: String,
    description: String,
    image: String,
    date: Date,
    location: String,
    category: String,
    registrationLink: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Careers Section Schema
const careersSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Join Our Team',
  },
  description: String,
  whyJoinUs: {
    heading: String,
    points: [String],
  },
  openings: [{
    title: String,
    department: String,
    location: String,
    type: String,
    experience: String,
    description: String,
    requirements: [String],
    responsibilities: [String],
    applyLink: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Group of Company Section Schema
const groupCompanySchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Our Extended Vision',
  },
  description: String,
  companies: [{
    name: String,
    fullName: String,
    description: [String],
    logo: String,
    images: [String],
    establishedYear: Number,
    category: String,
  }],
  partnershipInfo: {
    heading: String,
    description: [String],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Partnership Section Schema
const partnershipSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Partner With Us',
  },
  description: String,
  whyPartner: {
    heading: String,
    reasons: [String],
  },
  categories: [{
    title: String,
    description: String,
    benefits: [String],
    image: String,
    icon: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Footer Section Schema
const footerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Aikya Builders and Promoters',
  },
  tagline: {
    type: String,
    default: 'Building Future',
  },
  address: {
    type: String,
    default: 'No.247/B, Velachery Main Road, Selaiyur, Chennai, Tamil Nadu 600073, India',
  },
  phone: [String],
  email: {
    type: String,
    default: 'enquiry@aikyabuilders.com',
  },
  socialMedia: [{
    platform: String,
    url: String,
    icon: String,
  }],
  links: {
    company: [{
      label: String,
      href: String,
    }],
    resources: [{
      label: String,
      href: String,
    }],
  },
  copyright: String,
  developedBy: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create models
const Hero = mongoose.model('Hero', heroSchema, 'hero');
const About = mongoose.model('About', aboutSchema, 'about');
const WhyChoose = mongoose.model('WhyChoose', whyChooseSchema, 'whychoose');
const Contact = mongoose.model('Contact', contactSchema, 'contact');
const Leadership = mongoose.model('Leadership', leadershipSchema, 'leadership');
const Projects = mongoose.model('Projects', projectsSchema, 'projects');
const Testimonials = mongoose.model('Testimonials', testimonialsSchema, 'testimonials');
const SpecialOffers = mongoose.model('SpecialOffers', specialOffersSchema, 'specialoffers');
const Services = mongoose.model('Services', servicesSchema, 'services');
const News = mongoose.model('News', newsSchema, 'news');
const CSR = mongoose.model('CSR', csrSchema, 'csr');
const Events = mongoose.model('Events', eventsSchema, 'events');
const Careers = mongoose.model('Careers', careersSchema, 'careers');
const GroupCompany = mongoose.model('GroupCompany', groupCompanySchema, 'groupcompany');
const Partnership = mongoose.model('Partnership', partnershipSchema, 'partnership');
const Footer = mongoose.model('Footer', footerSchema, 'footer');

// Footer Items Schema (for CMS management)
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
});

const footerItemsSchema = new mongoose.Schema({
  items: [footerItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const FooterItems = mongoose.model('FooterItems', footerItemsSchema, 'footeritems');

export { 
  Hero, 
  About, 
  WhyChoose, 
  Contact, 
  Leadership, 
  Projects,
  Testimonials,
  SpecialOffers,
  Services,
  News,
  CSR,
  Events,
  Careers,
  GroupCompany,
  Partnership,
  Footer,
  FooterItems
};
