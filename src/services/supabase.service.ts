
import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Interfaces ---

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'Super Admin' | 'Editor' | 'Analyst';
  permissions: {
    canManageContent: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canRespondMessages: boolean;
  };
  lastActive: string;
}

export interface AnalyticsEvent {
  id?: string;
  type: 'page_view' | 'product_view' | 'affiliate_click' | 'add_to_cart';
  path?: string;
  targetId?: string;
  metadata?: any;
  timestamp: string;
}

export interface Product {
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string; // e.g., "20% OFF"
  description: string;
  category: string;
  subCategory?: string;
  image: string; 
  images?: string[]; 
  videoUrl?: string; // YouTube or MP4 link
  colors?: string[]; 
  sku?: string;
  affiliateLink: string;
  verified: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Sold Out';
  created_at?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  image: string;
  count: number;
  subCategories: string[]; // e.g. ["Dresses", "Tops"]
}

export interface HeroSlide {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

// New Interface for CMS Pages (About, Contact)
export interface PageContent {
  id?: string;
  slug: 'about' | 'contact';
  title: string;
  heroImage: string;
  introText: string;
  bodyContent: string; // Rich text or long description
  metaData: any; // Flexible JSON for specific page fields (e.g., signature image, values list)
}

export interface Settings {
  id?: string; 
  // Identity
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  curatorName: string;
  curatorBio: string;
  curatorImage: string;
  contactEmail: string;
  
  // Theme Engine
  themePrimaryColor: string; 
  themeSecondaryColor: string;
  themeFontHeading: string;
  themeFontBody: string;
  
  // Social
  socialInstagram?: string;
  socialTiktok?: string;
  
  // Integrations
  googleAnalyticsId?: string;
  emailJsPublicKey?: string;
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  date: string;
  replySent?: boolean;
}

export interface Review {
  id?: string;
  productId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// --- SEED CONSTANTS (Local Fallback) ---
const SEED_SETTINGS: Settings = {
  id: 'global_settings',
  siteName: "MAISON PORTAL",
  heroTitle: "The Art of Living",
  heroSubtitle: "Curating the exceptional for the modern muse.",
  curatorName: "Alexandra V.",
  curatorBio: "Luxury is a state of mind, not a price tag. I've dedicated myself to finding the few things that truly matter.",
  curatorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000",
  contactEmail: "concierge@maisonportal.com",
  themePrimaryColor: "#d97706",
  themeSecondaryColor: "#1c1917",
  themeFontHeading: "Playfair Display",
  themeFontBody: "Lato",
  socialInstagram: "https://instagram.com",
  socialTiktok: "https://tiktok.com",
};

const SEED_PAGES: PageContent[] = [
  {
    slug: 'about',
    title: 'The Origin Story',
    heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000',
    introText: 'From the Desk of the Curator',
    bodyContent: 'I started Maison Portal as a reaction to the noise. In a digital landscape cluttered with fast fashion, the act of curation is a form of resistance.\n\nWe believe that fewer, better things lead to a richer life. Every item in this store has been personally vetted for quality, sustainability, and timeless aesthetic appeal.',
    metaData: {
      signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_sample.svg',
      values: [
        { title: 'Mission', desc: 'Demystifying luxury.' },
        { title: 'Community', desc: 'Building a network of like-minded individuals.' },
        { title: 'Integrity', desc: 'Authenticity is our non-negotiable standard.' }
      ],
      galleryImages: [
         'https://images.unsplash.com/photo-1507032336878-13f1ce603160?q=80&w=800',
         'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800',
         'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800',
         'https://images.unsplash.com/photo-1485230946086-1d99d529a730?q=80&w=800'
      ]
    }
  },
  {
    slug: 'contact',
    title: 'Correspondence',
    heroImage: 'https://images.unsplash.com/photo-1549575936-397440b8a3c5?q=80&w=1500',
    introText: 'The Concierge',
    bodyContent: 'We are available for inquiries regarding partnerships, curation requests, and order assistance.',
    metaData: {
      locationText: 'Cape Town • Johannesburg',
      faq: [
        { q: "Do you ship internationally?", a: "Shipping depends on the retailer." },
        { q: "How do returns work?", a: "Returns are handled by the retailer." }
      ]
    }
  }
];

const SEED_CATEGORIES: Category[] = [
  { id: '1', name: 'Apparel', slug: 'apparel', count: 12, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', subCategories: ['Dresses', 'Outerwear', 'Tops'] },
  { id: '2', name: 'Accessories', slug: 'accessories', count: 8, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=800', subCategories: ['Bags', 'Jewelry', 'Eyewear'] },
  { id: '3', name: 'Home', slug: 'home', count: 5, image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800', subCategories: ['Decor', 'Scents', 'Textiles'] }
];

const SEED_SLIDES: HeroSlide[] = [
   { id: '1', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000', title: 'Golden Hour', subtitle: 'The Summer Collection', ctaText: 'View Edit', ctaLink: '/products' },
   { id: '2', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000', title: 'Soft Structure', subtitle: 'Architectural Silhouettes', ctaText: 'Explore', ctaLink: '/products' },
   { id: '3', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000', title: 'Modern Muse', subtitle: 'Timeless Essentials', ctaText: 'Shop Now', ctaLink: '/products' }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    title: 'Silk Charmeuse Gown',
    price: 4500,
    description: 'A floor-length gown crafted from 100% pure silk charmeuse. Features a bias cut for a flattering drape.',
    category: 'Apparel',
    subCategory: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000',
    affiliateLink: '#',
    verified: true,
    stockStatus: 'In Stock'
  },
  {
    id: 'prod_2',
    title: 'The Structured Tote',
    price: 8200,
    description: 'Italian leather tote with gold-plated hardware. Perfect for the modern professional.',
    category: 'Accessories',
    subCategory: 'Bags',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000',
    affiliateLink: '#',
    verified: true,
    stockStatus: 'Low Stock'
  },
  {
    id: 'prod_3',
    title: 'Ceramic Vase Set',
    price: 1200,
    description: 'Hand-thrown ceramic vases in a matte stone finish. Minimalist design.',
    category: 'Home',
    subCategory: 'Decor',
    image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?q=80&w=1000',
    affiliateLink: '#',
    verified: true,
    stockStatus: 'In Stock'
  }
];

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  
  // Core State
  initialized = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  currentUser = signal<AdminUser | null>(null);
  isOfflineMode = signal<boolean>(false);

  // Data Signals
  settings = signal<Settings | null>(null);
  pages = signal<PageContent[]>([]);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  heroSlides = signal<HeroSlide[]>([]);
  messages = signal<Message[]>([]);
  reviews = signal<Review[]>([]);
  
  // Admin Specific Signals
  adminUsers = signal<AdminUser[]>([]);
  analytics = signal<AnalyticsEvent[]>([]);

  // UI State
  connectionError = signal<string | null>(null);
  seedingStatus = signal<string | null>(null);

  constructor() {
    const SUPABASE_URL = process.env['SUPABASE_URL'] || '';
    const SUPABASE_KEY = process.env['SUPABASE_KEY'] || '';

    // If no keys, immediately go to Offline/Local Mode
    if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project')) {
      console.warn('SYSTEM: Supabase keys missing. Switching to Local Storage Mode.');
      this.isOfflineMode.set(true);
      this.connectionError.set('Offline Mode: Using Local Storage');
      this.bootLocalSystem();
      return;
    }

    try {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      this.initAuthListener();
      this.bootSystem();
    } catch (err: any) {
      console.error('SYSTEM: Client Init Error', err);
      this.isOfflineMode.set(true);
      this.bootLocalSystem();
    }
  }

  // --- AUTHENTICATION & LISTENER ---
  private async initAuthListener() {
    if (!this.supabase) return;

    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.hydrateUser(session.user);
    }

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        this.hydrateUser(session.user);
      } else {
        this.isAdmin.set(false);
        this.currentUser.set(null);
      }
    });
  }

  private hydrateUser(authUser: any) {
    const user: AdminUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email.split('@')[0],
      avatar: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${authUser.email}`,
      role: 'Super Admin', 
      permissions: { canManageContent:true, canManageSettings:true, canManageUsers:true, canRespondMessages:true, canViewAnalytics:true },
      lastActive: new Date().toISOString()
    };
    
    this.currentUser.set(user);
    this.isAdmin.set(true);
    // If online, fetch fresh data
    if(!this.isOfflineMode()) this.fetchAllData(); 
  }

  async loginWithPassword(email: string, password: string): Promise<{error: string | null}> {
    // Offline Mock Login
    if (this.isOfflineMode()) {
        if (email === 'admin@maison.com' && password === 'admin') {
            this.hydrateUser({ id: 'local-admin', email: 'admin@maison.com' });
            return { error: null };
        }
        return { error: 'Invalid offline credentials (try admin@maison.com / admin)' };
    }

    const { data, error } = await this.supabase!.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error: error.message };
    if (data.user) {
        this.hydrateUser(data.user);
        return { error: null };
    }
    return { error: 'Unknown login error' };
  }

  async loginWithGoogle() {
     if (this.isOfflineMode()) {
         alert('Google Login not available in offline mode.');
         return;
     }
     const { data, error } = await this.supabase!.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: window.location.origin + '/admin'
       }
     });
     if (error) console.error('OAuth Error:', error);
     return data;
  }

  async logout() {
    this.isAdmin.set(false);
    this.currentUser.set(null);
    if (!this.isOfflineMode()) {
        await this.supabase!.auth.signOut();
    }
  }

  // --- LOCAL STORAGE HELPERS ---
  private getLocal<T>(key: string, defaultVal: T): T {
    try {
        const stored = localStorage.getItem('maison_' + key);
        return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
        return defaultVal;
    }
  }

  private setLocal(key: string, data: any) {
    try {
        localStorage.setItem('maison_' + key, JSON.stringify(data));
    } catch (e) {
        console.error('LocalStorage Write Error', e);
    }
  }

  // --- SYSTEM BOOT ---
  private bootLocalSystem() {
    // Load from local storage, or use SEED constants if local is empty
    this.settings.set(this.getLocal('settings', SEED_SETTINGS));
    this.pages.set(this.getLocal('pages', SEED_PAGES));
    this.products.set(this.getLocal('products', SEED_PRODUCTS));
    this.categories.set(this.getLocal('categories', SEED_CATEGORIES));
    this.heroSlides.set(this.getLocal('hero_slides', SEED_SLIDES));
    this.messages.set(this.getLocal('messages', []));
    this.reviews.set(this.getLocal('reviews', []));
    this.analytics.set(this.getLocal('analytics', []));
    
    this.initialized.set(true);
  }

  private async bootSystem() {
    this.connectionError.set(null);
    try {
      // 1. Check if we have settings. If not, the DB is likely empty.
      const { data: settingsData, error } = await this.supabase!.from('settings').select('*').limit(1);
      
      if (error || !settingsData || settingsData.length === 0) {
         console.warn("SYSTEM: Database empty or unreachable. attempting Auto-Seed or Local Fallback.");
         if (settingsData && settingsData.length === 0) {
            await this.performAutoSeed();
         } else {
            throw new Error("Supabase connection failed");
         }
      } else {
         await this.fetchAllData();
      }
      
      this.initialized.set(true);
    } catch (err: any) {
      console.warn("SYSTEM: Switching to Offline/Local Mode due to error:", err.message);
      this.isOfflineMode.set(true);
      this.bootLocalSystem();
    }
  }

  // --- SEEDING (One-Way) ---
  private async performAutoSeed() {
    this.seedingStatus.set('Seeding Global Settings...');
    try {
      await this.supabase!.from('settings').insert(SEED_SETTINGS);
      
      this.seedingStatus.set('Seeding CMS Content...');
      await this.supabase!.from('pages').insert(SEED_PAGES);

      // Seed categories
      await this.supabase!.from('categories').insert(SEED_CATEGORIES);
      
      // Seed Slides
      await this.supabase!.from('hero_slides').insert(SEED_SLIDES);

      // Seed Sample Products
      await this.supabase!.from('products').insert(SEED_PRODUCTS);

      await this.fetchAllData();
      this.seedingStatus.set(null);
    } catch (err: any) {
      this.connectionError.set(`Seeding Failed: ${err.message}`);
      // Fallback
      this.bootLocalSystem();
    }
  }

  async forceResync() {
    if (this.isOfflineMode()) {
        // Reset Local Storage to Seeds
        localStorage.clear();
        this.bootLocalSystem();
        alert('Local Storage Reset to Factory Defaults.');
        return;
    }
    await this.performAutoSeed();
  }

  // --- DATA FETCHING ---
  private async fetchAllData() {
    if (this.isOfflineMode()) return;

    try {
        const [settings, products, cats, slides, pages, reviews, analytics] = await Promise.all([
            this.supabase!.from('settings').select('*').single(),
            this.supabase!.from('products').select('*').order('created_at', { ascending: false }),
            this.supabase!.from('categories').select('*'),
            this.supabase!.from('hero_slides').select('*'),
            this.supabase!.from('pages').select('*'),
            this.supabase!.from('reviews').select('*'),
            this.supabase!.from('analytics_events').select('*').order('timestamp', { ascending: false }).limit(500)
        ]);

        if (settings.data) { this.settings.set(settings.data); this.setLocal('settings', settings.data); }
        if (products.data) { this.products.set(products.data); this.setLocal('products', products.data); }
        if (cats.data) { this.categories.set(cats.data); this.setLocal('categories', cats.data); }
        if (slides.data) { this.heroSlides.set(slides.data); this.setLocal('hero_slides', slides.data); }
        if (pages.data) { this.pages.set(pages.data); this.setLocal('pages', pages.data); }
        if (reviews.data) { this.reviews.set(reviews.data); this.setLocal('reviews', reviews.data); }
        if (analytics.data) { this.analytics.set(analytics.data); this.setLocal('analytics', analytics.data); }

        if (this.isAdmin()) {
            const { data: msgs } = await this.supabase!.from('messages').select('*').order('date', { ascending: false });
            if (msgs) { this.messages.set(msgs); this.setLocal('messages', msgs); }
        }
    } catch (err) {
        console.error("Fetch Error - falling back to local", err);
        this.bootLocalSystem(); // Fallback if a fetch fails mid-session
    }
  }

  // --- GETTERS FOR COMPONENTS ---
  getPageContent(slug: 'about' | 'contact') {
    return this.pages().find(p => p.slug === slug);
  }

  getProduct(id: string) { return this.products().find(p => p.id === id); }

  // --- CRUD OPERATIONS (Hybrid) ---
  
  // Settings
  async updateSettings(newSettings: Partial<Settings>) {
      const updated = { ...this.settings(), ...newSettings } as Settings;
      this.settings.set(updated);
      this.setLocal('settings', updated);

      if (!this.isOfflineMode()) {
        await this.supabase!.from('settings').update(newSettings).eq('id', this.settings()!.id);
      }
  }

  // Pages (CMS)
  async updatePage(slug: string, updates: Partial<PageContent>) {
      const updatedList = this.pages().map(x => x.slug === slug ? { ...x, ...updates } : x);
      this.pages.set(updatedList);
      this.setLocal('pages', updatedList);

      if (!this.isOfflineMode()) {
        await this.supabase!.from('pages').update(updates).eq('slug', slug);
      }
  }

  // Products
  async addProduct(product: any) { 
      // Optimistic Update
      const newProd = { ...product, id: `local_${Date.now()}`, created_at: new Date().toISOString() };
      
      if (!this.isOfflineMode()) {
         const {data} = await this.supabase!.from('products').insert(product).select().single();
         if(data) {
             this.products.update(p => [data, ...p]);
             this.setLocal('products', this.products());
             return;
         }
      }
      
      // Offline fallback
      this.products.update(p => [newProd, ...p]);
      this.setLocal('products', this.products());
  }

  async updateProduct(id: string, updates: any) {
      this.products.update(p => p.map(x => x.id === id ? {...x, ...updates} : x));
      this.setLocal('products', this.products());

      if (!this.isOfflineMode()) {
        await this.supabase!.from('products').update(updates).eq('id', id);
      }
  }

  async deleteProduct(id: string) {
      this.products.update(p => p.filter(x => x.id !== id));
      this.setLocal('products', this.products());

      if (!this.isOfflineMode()) {
        await this.supabase!.from('products').delete().eq('id', id);
      }
  }

  // Categories
  async addCategory(cat: any) {
    const newCat = { ...cat, id: `cat_${Date.now()}` };
    
    if (!this.isOfflineMode()) {
        const {data} = await this.supabase!.from('categories').insert(cat).select().single();
        if(data) {
            this.categories.update(c => [...c, data]);
            this.setLocal('categories', this.categories());
            return;
        }
    }

    this.categories.update(c => [...c, newCat]);
    this.setLocal('categories', this.categories());
  }
  async updateCategory(id: string, updates: any) {
    this.categories.update(c => c.map(x => x.id === id ? {...x, ...updates} : x));
    this.setLocal('categories', this.categories());

    if (!this.isOfflineMode()) {
        await this.supabase!.from('categories').update(updates).eq('id', id);
    }
  }

  // Slides
  async addSlide(slide: any) {
      const newSlide = { ...slide, id: `slide_${Date.now()}` };
      
      if(!this.isOfflineMode()) {
          const {data} = await this.supabase!.from('hero_slides').insert(slide).select().single();
          if(data) {
              this.heroSlides.update(s => [...s, data]);
              this.setLocal('hero_slides', this.heroSlides());
              return;
          }
      }
      this.heroSlides.update(s => [...s, newSlide]);
      this.setLocal('hero_slides', this.heroSlides());
  }
  async deleteSlide(id: string) {
       this.heroSlides.update(s => s.filter(x => x.id !== id));
       this.setLocal('hero_slides', this.heroSlides());
       if (!this.isOfflineMode()) {
           await this.supabase!.from('hero_slides').delete().eq('id', id);
       }
  }

  // Storage
  async uploadFile(file: File) {
    // Offline Mock
    if (this.isOfflineMode()) {
        return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await this.supabase!.storage.from('maison-assets').upload(fileName, file);
    if (error) {
        console.error('Upload Error', error);
        return null;
    }
    const { data } = this.supabase!.storage.from('maison-assets').getPublicUrl(fileName);
    return data.publicUrl;
  }

  // --- ANALYTICS ---
  async trackEvent(type: AnalyticsEvent['type'], path: string, targetId?: string, metadata?: any) {
    const event: AnalyticsEvent = {
        type,
        path,
        targetId,
        metadata,
        timestamp: new Date().toISOString()
    };
    this.analytics.update(a => [event, ...a]);
    this.setLocal('analytics', this.analytics());

    if (!this.isOfflineMode()) {
        await this.supabase!.from('analytics_events').insert(event);
    }
  }

  // --- MESSAGES & REVIEWS ---
  async sendMessage(msg: any) { 
      const newMsg = { ...msg, read: false, date: new Date().toISOString() };
      this.messages.update(m => [newMsg, ...m]); // Local update for testing
      
      if (!this.isOfflineMode()) {
          await this.supabase!.from('messages').insert(newMsg);
      }
  }

  async markMessageRead(id: string) {
    this.messages.update(m => m.map(x => x.id === id ? {...x, read: true} : x));
    this.setLocal('messages', this.messages());
    if(!this.isOfflineMode()) {
        await this.supabase!.from('messages').update({read:true}).eq('id', id);
    }
  }

  async addReview(review: any) {
     const newReview = {...review, id: `rev_${Date.now()}`, date: new Date().toISOString()};
     this.reviews.update(r => [newReview, ...r]);
     this.setLocal('reviews', this.reviews());
     
     if (!this.isOfflineMode()) {
        const {data} = await this.supabase!.from('reviews').insert({...review, date: new Date().toISOString()}).select().single();
        if(data) {
            // Replace optimistic with real
             this.reviews.update(r => [data, ...r.filter(x => x.id !== newReview.id)]);
        }
     }
  }
}
