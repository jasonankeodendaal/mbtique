
import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <!-- Page Container: Light Stone -->
    <div class="min-h-screen bg-[#FDFBF7] text-stone-900 pb-32">
      
      <!-- Hero Carousel Section -->
      <div class="relative h-[50vh] md:h-[60vh] w-full overflow-hidden shadow-lg">
        @for (slide of slides; track slide.image; let i = $index) {
          <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
               [class.opacity-100]="currentSlide() === i"
               [class.opacity-0]="currentSlide() !== i">
            <img [src]="slide.image" class="w-full h-full object-cover">
            <!-- Light Overlay for text readability -->
            <div class="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
          </div>
        }
        
        <!-- Hero Content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-12">
          <p class="font-cormorant italic text-2xl md:text-3xl text-stone-800 drop-shadow-sm mb-2 animate-fade-up">The Seasonal Collection</p>
          <h1 class="text-5xl md:text-8xl font-serif text-stone-900 drop-shadow-md mb-6 tracking-tight animate-fade-up">
            {{ slides[currentSlide()].title }}
          </h1>
          <p class="max-w-xl text-stone-800 text-sm md:text-base font-bold leading-relaxed hidden md:block animate-fade-up bg-white/70 p-4 backdrop-blur-sm rounded-sm shadow-sm">
            Curated pieces that define modern elegance. High contrast textures, timeless silhouettes.
          </p>
          
          <!-- Carousel Indicators -->
          <div class="absolute bottom-8 flex gap-3">
             @for (slide of slides; track slide; let i = $index) {
               <button (click)="currentSlide.set(i)" 
                  class="w-2 h-2 rounded-full transition-all duration-300 shadow-sm"
                  [class.bg-stone-800]="currentSlide() === i"
                  [class.w-8]="currentSlide() === i"
                  [class.bg-white]="currentSlide() !== i">
               </button>
             }
          </div>
        </div>
      </div>

      <!-- Filter & Sort Bar (Sticky) -->
      <div class="sticky top-24 z-30 bg-white/95 backdrop-blur-md py-6 px-6 md:px-12 transition-all duration-300 border-b border-stone-200 shadow-sm">
        <div class="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <!-- Categories (Pills) -->
          <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
             <button (click)="filter.set('All')" 
               class="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm rounded-full"
               [class.bg-stone-800]="filter() === 'All'"
               [class.border-stone-800]="filter() === 'All'"
               [class.text-white]="filter() === 'All'"
               [class.bg-white]="filter() !== 'All'"
               [class.border-stone-200]="filter() !== 'All'"
               [class.text-stone-500]="filter() !== 'All'"
               [class.hover:border-stone-800]="filter() !== 'All'">
               All
             </button>
             @for (cat of supabase.categories(); track cat.id) {
                <button (click)="filter.set(cat.name)" 
                  class="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm whitespace-nowrap rounded-full"
                  [class.bg-stone-800]="filter() === cat.name"
                  [class.border-stone-800]="filter() === cat.name"
                  [class.text-white]="filter() === cat.name"
                  [class.bg-white]="filter() !== cat.name"
                  [class.border-stone-200]="filter() !== cat.name"
                  [class.text-stone-500]="filter() !== cat.name"
                  [class.hover:border-stone-800]="filter() !== cat.name">
                  {{ cat.name }}
                </button>
             }
          </div>

          <!-- Tools (Search & Sort) -->
          <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-stone-200 pt-4 md:pt-0">
             
             <!-- Search -->
             <div class="relative group">
                <input [(ngModel)]="searchQuery" placeholder="Search archive..." class="bg-stone-100 rounded-full border border-stone-200 focus:border-stone-400 py-2 pl-4 pr-10 text-xs font-bold text-stone-800 focus:outline-none w-32 md:w-48 transition-all placeholder-stone-400">
                <svg class="w-3 h-3 text-stone-500 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>

             <!-- Sort -->
             <div class="relative flex items-center gap-2">
                <span class="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Sort</span>
                <select [(ngModel)]="sortBy" class="appearance-none bg-transparent text-[10px] uppercase tracking-widest font-bold text-stone-800 focus:outline-none pr-4 cursor-pointer hover:text-yellow-600 transition-colors">
                   <option value="newest">Newest</option>
                   <option value="price-asc">Price: Low to High</option>
                   <option value="price-desc">Price: High to Low</option>
                </select>
             </div>
          </div>
        </div>
        
        <!-- Breadcrumbs Visual -->
        <div class="max-w-[1920px] mx-auto mt-4 pt-4 border-t border-stone-100 flex gap-6 text-[9px] uppercase tracking-widest text-stone-400 font-bold">
            <span class="text-yellow-600">New Arrivals</span>
            <span class="hover:text-stone-900 cursor-pointer transition-colors">Best Sellers</span>
            <span class="hover:text-stone-900 cursor-pointer transition-colors">Curator Picks</span>
            <span class="hover:text-stone-900 cursor-pointer transition-colors">Coming Soon</span>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="max-w-[1920px] mx-auto px-4 md:px-8 mt-8">
         <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6 lg:gap-8">
             
           @for (product of filteredProducts(); track product.id) {
              <div class="group flex flex-col cursor-pointer fade-in" (click)="openQuickView(product)">
                 
                 <!-- Image Container -->
                 <div class="relative overflow-hidden bg-white aspect-[3/5] shadow-sm hover:shadow-xl transition-all duration-500 rounded-sm">
                    
                    <!-- Main Image (Full Color) -->
                    <img [src]="product.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105 opacity-100"
                         [class.opacity-0]="hoveredProduct() === product.id && product.images && product.images.length > 0">

                    <!-- Secondary Hover Image -->
                    @if (product.images && product.images.length > 0) {
                        <img [src]="product.images[0]" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out scale-105 group-hover:scale-100 opacity-0"
                             [class.opacity-100]="hoveredProduct() === product.id"
                             (mouseenter)="hoveredProduct.set(product.id || '')" 
                             (mouseleave)="hoveredProduct.set('')">
                    } @else {
                        <div class="absolute inset-0" (mouseenter)="hoveredProduct.set(product.id || '')" (mouseleave)="hoveredProduct.set('')"></div>
                    }
                    
                    <!-- Tags -->
                    <div class="absolute top-3 left-3 flex flex-col gap-1">
                        @if (product.stockStatus === 'Low Stock') {
                           <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[7px] uppercase tracking-widest font-bold shadow-sm rounded-sm">Low Stock</span>
                        }
                        @if (product.verified) {
                           <span class="bg-white text-stone-800 px-2 py-0.5 text-[7px] uppercase tracking-widest font-bold shadow-sm flex items-center gap-1 rounded-sm border border-stone-100">
                             <svg class="w-2 h-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                             Verified
                           </span>
                        }
                    </div>

                    <!-- Quick Action Overlay -->
                    <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button class="w-full bg-white/95 text-stone-900 py-2 text-[8px] uppercase tracking-widest font-bold shadow-lg hover:bg-stone-900 hover:text-white transition-colors rounded-sm border border-stone-100">
                           Quick View
                        </button>
                    </div>
                 </div>

                 <!-- Details -->
                 <div class="mt-4 px-1 text-center group-hover:text-yellow-700 transition-colors">
                    <h3 class="font-serif text-sm text-stone-900 truncate mb-1 font-bold group-hover:text-yellow-700 transition-colors">{{ product.title }}</h3>
                    <div class="flex justify-center items-center gap-2">
                       <span class="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{{ product.category }}</span>
                       <span class="w-0.5 h-0.5 rounded-full bg-stone-300"></span>
                       <span class="font-bold text-xs text-stone-800">R {{ product.price }}</span>
                    </div>
                 </div>

              </div>
           } @empty {
              <div class="col-span-full py-32 text-center rounded-sm bg-stone-50 border border-stone-200">
                 <p class="font-cormorant italic text-3xl text-stone-400 mb-2">The Archive is Silent</p>
                 <p class="text-stone-500 text-[9px] uppercase tracking-widest font-bold">No objects found matching your criteria.</p>
                 <button (click)="filter.set('All'); searchQuery.set('')" class="mt-6 text-xs text-stone-800 border-b-2 border-yellow-500 font-bold hover:bg-yellow-100 hover:border-transparent transition-all">Reset Filters</button>
              </div>
           }
         </div>
      </div>

      <!-- Quick View Modal (White/Stone) -->
      @if (quickViewProduct(); as qp) {
         <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" (click)="closeQuickView()">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-fade-in"></div>
            
            <!-- Modal Content -->
            <div class="bg-white w-full max-w-5xl h-auto md:h-[85vh] relative z-10 flex flex-col md:flex-row overflow-hidden shadow-2xl animate-fade-up rounded-lg" (click)="$event.stopPropagation()">
               
               <button (click)="closeQuickView()" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white text-stone-800 hover:bg-stone-100 shadow-md transition-all rounded-full border border-stone-100">✕</button>

               <!-- Left: Gallery -->
               <div class="w-full md:w-1/2 bg-stone-50 relative h-72 md:h-full group flex items-center justify-center overflow-hidden">
                  <img [src]="quickViewImage()" class="w-full h-full object-cover">
                  
                  <!-- Thumbnails -->
                  <div class="absolute bottom-6 left-0 w-full flex justify-center gap-3 px-6">
                      <button (click)="quickViewImage.set(qp.image)" 
                          class="w-12 h-16 overflow-hidden border-2 transition-all shadow-lg rounded-sm"
                          [class.border-yellow-500]="quickViewImage() === qp.image"
                          [class.border-white]="quickViewImage() !== qp.image"
                          [class.scale-110]="quickViewImage() === qp.image">
                          <img [src]="qp.image" class="w-full h-full object-cover">
                      </button>
                      @for (img of (qp.images || []); track img) {
                        <button (click)="quickViewImage.set(img)" 
                            class="w-12 h-16 overflow-hidden border-2 transition-all shadow-lg rounded-sm"
                            [class.border-yellow-500]="quickViewImage() === img"
                            [class.border-white]="quickViewImage() !== img"
                            [class.scale-110]="quickViewImage() === img">
                            <img [src]="img" class="w-full h-full object-cover">
                        </button>
                      }
                  </div>
               </div>

               <!-- Right: Info -->
               <div class="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col bg-white text-stone-900">
                  <span class="text-[9px] uppercase tracking-[0.3em] text-yellow-600 mb-2 font-bold">{{ qp.category }}</span>
                  <h2 class="text-3xl md:text-5xl font-serif text-stone-900 mb-4 leading-none">{{ qp.title }}</h2>
                  
                  <div class="flex items-baseline gap-4 mb-8 border-b border-stone-100 pb-6">
                     <span class="text-3xl font-bold text-stone-900">R {{ qp.price }}</span>
                     @if (qp.originalPrice) {
                        <span class="text-stone-400 line-through font-serif italic">R {{ qp.originalPrice }}</span>
                     }
                  </div>

                  <p class="font-cormorant text-xl text-stone-600 leading-relaxed italic mb-8 flex-grow">
                     "{{ qp.description }}"
                  </p>

                  @if (qp.colors && qp.colors.length > 0) {
                     <div class="mb-8">
                        <span class="text-[9px] uppercase tracking-widest text-stone-400 font-bold block mb-3">Palette</span>
                        <div class="flex gap-3">
                           @for (c of qp.colors; track c) {
                              <div class="w-8 h-8 rounded-full border-2 border-stone-100 shadow-sm" [style.background-color]="c"></div>
                           }
                        </div>
                     </div>
                  }

                  <div class="space-y-3 mt-auto pt-6">
                     <a [href]="qp.affiliateLink" target="_blank" class="block w-full bg-stone-900 text-white text-center py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl rounded-sm">
                        Acquire Object
                     </a>
                     <a [routerLink]="['/product', qp.id]" class="block w-full border border-stone-300 text-stone-900 text-center py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-colors rounded-sm" (click)="closeQuickView()">
                        Full Details
                     </a>
                  </div>

               </div>
            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProductsComponent implements OnDestroy {
  supabase = inject(SupabaseService);
  
  // State
  filter = signal<string>('All');
  searchQuery = signal<string>('');
  sortBy = signal<'newest' | 'price-asc' | 'price-desc'>('newest');
  
  // Hover & Modal State
  hoveredProduct = signal<string>('');
  quickViewProduct = signal<Product | null>(null);
  quickViewImage = signal<string>('');

  // Hero Slider State
  currentSlide = signal(0);
  slides = [
    { title: 'Golden Hour', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000' },
    { title: 'Soft Structure', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000' },
    { title: 'Modern Muse', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000' }
  ];

  intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      this.currentSlide.update(c => (c + 1) % this.slides.length);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  filteredProducts = computed(() => {
    let items = this.supabase.products();
    
    // 1. Filter by Category
    const currentFilter = this.filter();
    if (currentFilter !== 'All') {
        items = items.filter(p => p.category === currentFilter);
    }

    // 2. Filter by Search
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
        items = items.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // 3. Sort
    return [...items].sort((a, b) => {
        switch (this.sortBy()) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'newest': 
            default:
                return 0; 
        }
    });
  });

  openQuickView(p: Product) {
      this.quickViewProduct.set(p);
      this.quickViewImage.set(p.image);
      document.body.style.overflow = 'hidden'; 
  }

  closeQuickView() {
      this.quickViewProduct.set(null);
      document.body.style.overflow = '';
  }
}
