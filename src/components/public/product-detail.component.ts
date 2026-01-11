import { Component, inject, computed, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { SupabaseService, Review } from '../../services/supabase.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (product(); as p) {
      <div class="min-h-screen bg-[#FDFBF7] text-stone-900">
        
        <!-- Navigation Breadcrumbs -->
        <div class="pt-32 pb-6 px-6 md:px-12 max-w-[1920px] mx-auto border-b border-stone-200 flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
           <a routerLink="/" class="hover:text-stone-900 transition-colors">Home</a>
           <span>/</span>
           <a routerLink="/products" class="hover:text-stone-900 transition-colors">The Edit</a>
           <span>/</span>
           <span class="text-stone-900 font-black">{{ p.category }}</span>
        </div>

        <div class="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
          
          <!-- LEFT: VISUAL GALLERY -->
          <div class="lg:col-span-7 bg-white relative">
             <div class="sticky top-24 h-[calc(100vh-6rem)] flex flex-col-reverse md:flex-row">
                
                <!-- Desktop Thumbnails Strip -->
                <div class="hidden md:flex flex-col gap-4 p-6 w-24 overflow-y-auto hide-scrollbar border-r border-stone-100">
                   <button 
                      class="w-full aspect-[3/4] overflow-hidden border-2 transition-all duration-300 relative group rounded-sm"
                      [class.border-stone-900]="activeImage() === p.image"
                      [class.border-transparent]="activeImage() !== p.image"
                      (click)="activeImage.set(p.image)">
                      <img [src]="p.image" class="w-full h-full object-cover opacity-80 group-hover:opacity-100">
                   </button>
                   @for (img of (p.images || []); track img) {
                     <button 
                        class="w-full aspect-[3/4] overflow-hidden border-2 transition-all duration-300 relative group rounded-sm"
                        [class.border-stone-900]="activeImage() === img"
                        [class.border-transparent]="activeImage() !== img"
                        (click)="activeImage.set(img)">
                        <img [src]="img" class="w-full h-full object-cover opacity-80 group-hover:opacity-100">
                     </button>
                   }
                </div>

                <!-- Main Canvas -->
                <div class="flex-1 relative bg-stone-50 overflow-hidden cursor-zoom-in group">
                   <img [src]="activeImage()" class="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105">
                </div>
             </div>
          </div>

          <!-- RIGHT: PRODUCT DETAILS -->
          <div class="lg:col-span-5 px-6 md:px-16 py-12 lg:py-24 flex flex-col lg:min-h-screen text-stone-900">
             
             <!-- Header Info -->
             <div class="mb-10">
                <div class="flex justify-between items-start mb-6">
                   <div>
                      <h1 class="text-5xl md:text-6xl font-serif text-stone-900 italic leading-none mb-3">{{ p.title }}</h1>
                      <div class="flex items-center gap-3">
                         <span class="text-[9px] uppercase tracking-widest text-stone-500 font-bold">SKU: {{ p.sku || p.id?.substring(0,8) | uppercase }}</span>
                         @if (p.verified) {
                            <span class="bg-stone-900 text-white px-2 py-0.5 text-[8px] uppercase tracking-widest flex items-center gap-1 font-bold rounded-sm">
                               <svg class="w-2 h-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                               Curator Verified
                            </span>
                         }
                      </div>
                   </div>
                </div>

                <!-- Price Block -->
                <div class="flex items-baseline gap-4 border-b border-stone-200 pb-8">
                   <span class="text-4xl font-light text-stone-900">R {{ p.price }}</span>
                   @if (p.originalPrice && p.originalPrice > p.price) {
                      <span class="text-xl text-stone-400 line-through font-serif italic">R {{ p.originalPrice }}</span>
                   }
                </div>
             </div>

             <!-- Description -->
             <div class="mb-12">
                <p class="font-cormorant text-2xl text-stone-800 leading-relaxed italic pl-6 border-l-4 border-yellow-600">
                   "{{ p.description }}"
                </p>
             </div>

             <!-- Actions (Affiliate Specific) -->
             <div class="mb-10 space-y-4">
                <a [href]="p.affiliateLink" target="_blank" (click)="trackConversion(p)" class="block w-full bg-stone-900 text-white text-center py-6 uppercase tracking-[0.25em] text-sm font-bold hover:bg-yellow-600 hover:text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden rounded-sm animate-pulse">
                   <span class="relative z-10">Secure Acquisition</span>
                   <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </a>
                
                <p class="text-[9px] text-center text-stone-400 uppercase tracking-widest font-bold mt-4">Secure checkout processed via Official Retailer</p>
             </div>

             <!-- Reviews Section -->
             <div id="reviews-section" class="border-t border-stone-200 pt-12">
                <div class="flex justify-between items-end mb-8">
                   <h3 class="font-serif text-3xl text-stone-900">Impressions</h3>
                   <button (click)="showReviewForm = !showReviewForm" class="text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 border-stone-900 pb-1 hover:text-yellow-600 hover:text-yellow-600 hover:border-yellow-600 transition-colors">
                      {{ showReviewForm ? 'Cancel' : 'Write Review' }}
                   </button>
                </div>

                @if (showReviewForm) {
                   <div class="bg-white p-6 mb-8 animate-fade-up border border-stone-200 shadow-sm rounded-sm">
                      <div class="mb-4">
                        <label class="block text-[9px] uppercase tracking-widest text-stone-500 font-bold mb-2">Name</label>
                        <input [(ngModel)]="newReview.user" class="w-full bg-stone-50 border-b border-stone-300 py-2 text-sm focus:outline-none focus:border-stone-800 transition-colors placeholder-stone-300">
                      </div>
                      <div class="mb-6">
                        <label class="block text-[9px] uppercase tracking-widest text-stone-500 font-bold mb-2">Thoughts</label>
                        <textarea [(ngModel)]="newReview.comment" rows="3" class="w-full bg-stone-50 border border-stone-300 p-3 text-sm focus:outline-none focus:border-stone-800 transition-colors font-serif italic"></textarea>
                      </div>
                      <button (click)="submitReview()" [disabled]="!newReview.user || !newReview.comment" class="w-full bg-stone-900 text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-600 transition-all disabled:opacity-50 rounded-sm">
                        Post Review
                      </button>
                   </div>
                }

                <div class="space-y-8">
                   @for (review of productReviews(); track review.id) {
                      <div class="pb-8 border-b border-stone-100 last:border-0">
                         <div class="flex justify-between mb-2">
                            <span class="text-xs font-bold text-stone-900 uppercase tracking-wide">{{ review.user }}</span>
                            <span class="text-[9px] text-stone-400">{{ review.date | date:'mediumDate' }}</span>
                         </div>
                         <p class="font-cormorant text-lg text-stone-700 italic">"{{ review.comment }}"</p>
                      </div>
                   } @empty {
                      <p class="text-center py-8 text-stone-400 font-light italic">No impressions yet.</p>
                   }
                </div>
             </div>

          </div>
        </div>
      </div>
    }
  `
})
export class ProductDetailComponent {
  supabase = inject(SupabaseService);
  // FIX: Explicitly type ActivatedRoute
  route: ActivatedRoute = inject(ActivatedRoute);

  productId = toSignal(this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))));
  
  product = computed(() => {
    const id = this.productId();
    if (!id) return undefined;
    return this.supabase.getProduct(id);
  });

  activeImage = signal<string>('');

  constructor() {
    effect(() => {
        const p = this.product();
        if (p) {
            this.activeImage.set(p.image);
            // Track View
            if (p.id) {
                this.supabase.trackEvent('product_view', '/product/' + p.id, p.id);
            }
        }
    });
  }

  productReviews = computed(() => {
    const id = this.productId();
    if (!id) return [];
    return this.supabase.reviews().filter(r => r.productId === id);
  });

  showReviewForm = false;
  newReview = { user: '', rating: 5, comment: '' };

  trackConversion(p: any) {
      this.supabase.trackEvent('affiliate_click', p.affiliateLink, p.id);
  }

  submitReview() {
    const id = this.productId();
    if (id && this.newReview.user && this.newReview.comment) {
      this.supabase.addReview({
        productId: id,
        user: this.newReview.user,
        rating: 5,
        comment: this.newReview.comment
      });
      this.newReview = { user: '', rating: 5, comment: '' };
      this.showReviewForm = false;
    }
  }
}