
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <!-- Cinematic Hero Section (Carousel) -->
    <section class="relative h-[90vh] w-full overflow-hidden bg-stone-100">
      
      @for (slide of supabase.heroSlides(); track slide.id; let i = $index) {
        <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
             [class.opacity-100]="currentSlide() === i"
             [class.opacity-0]="currentSlide() !== i">
          <img [src]="slide.image" class="absolute inset-0 w-full h-full object-cover">
          <!-- Heavy Gradient for Text Readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30"></div>
          
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            <p class="font-cormorant italic text-3xl md:text-4xl mb-4 text-white/90 animate-fade-up drop-shadow-md">Curated for the refined eye</p>
            <h1 class="text-6xl md:text-9xl font-serif tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto drop-shadow-lg text-white">
              {{ slide.title }}
            </h1>
            <p class="text-sm md:text-lg uppercase tracking-[0.3em] font-bold max-w-xl text-white/90 mb-12 bg-black/40 p-6 backdrop-blur-md rounded-sm border border-white/20">
              {{ slide.subtitle }}
            </p>
            <a [routerLink]="slide.ctaLink" class="group relative px-12 py-5 border-2 border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-xl">
              <span class="font-bold uppercase tracking-[0.2em] text-sm">{{ slide.ctaText }}</span>
            </a>
          </div>
        </div>
      }

      <!-- Fallback if no slides -->
      @if (supabase.heroSlides().length === 0) {
        <div class="absolute inset-0 flex items-center justify-center bg-stone-200">
           <p class="text-stone-500 font-bold uppercase tracking-widest">Loading Collection...</p>
        </div>
      }

      <!-- Indicators -->
      <div class="absolute bottom-12 left-0 w-full flex justify-center gap-4 z-20">
         @for (slide of supabase.heroSlides(); track slide.id; let i = $index) {
            <button (click)="currentSlide.set(i)" class="w-2 h-2 rounded-full transition-all duration-300"
              [class.bg-white]="currentSlide() === i"
              [class.w-8]="currentSlide() === i"
              [class.bg-white/40]="currentSlide() !== i">
            </button>
         }
      </div>
    </section>

    <!-- The "Bridge" Intro (Personal Branding) -->
    <section class="py-20 md:py-32 bg-[#FDFBF7] text-stone-900">
      <div class="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        <!-- Text Column -->
        <div class="order-2 md:order-1 col-span-1">
           <span class="text-xs font-bold tracking-[0.3em] text-yellow-600 uppercase mb-4 block">The Curator</span>
           <h2 class="text-4xl md:text-7xl font-serif text-stone-900 mb-6 leading-none">
             Hi, I'm <br><span class="font-cormorant italic text-stone-600">{{ supabase.settings()?.curatorName }}</span>.
           </h2>
           <div class="border-l-4 border-yellow-500 pl-8 mb-10">
              <p class="text-lg md:text-xl font-medium text-stone-800 leading-relaxed">
               "{{ supabase.settings()?.curatorBio }}"
              </p>
           </div>
           <a routerLink="/about" class="inline-flex items-center gap-3 text-xs uppercase font-bold tracking-widest border-b-2 border-stone-900 pb-1 hover:text-yellow-600 hover:border-yellow-600 transition-colors">
             Read Full Story <span class="font-serif italic text-lg text-yellow-600">&rarr;</span>
           </a>
        </div>
        <!-- Image Column -->
        <div class="order-1 md:order-2 col-span-1 relative px-4">
           <div class="absolute top-0 right-0 w-full h-full border-2 border-stone-300 -z-10 transform translate-x-4 md:translate-x-8 -translate-y-4 md:-translate-y-8"></div>
           <div class="absolute bottom-0 left-0 w-32 h-32 bg-yellow-100 -z-10 -mb-4 -ml-4 rounded-full blur-2xl opacity-70"></div>
           <img [src]="supabase.settings()?.curatorImage" class="w-full aspect-[4/5] object-cover shadow-2xl shadow-stone-300/50 grayscale hover:grayscale-0 transition-all duration-700">
        </div>
      </div>
    </section>

    <!-- Category Strip -->
    <section class="py-16 border-y border-stone-200 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex gap-12 md:justify-center overflow-x-auto hide-scrollbar pb-4 md:pb-0">
          @for (cat of supabase.categories(); track cat.id) {
            <a routerLink="/products" class="flex flex-col items-center group min-w-[100px] cursor-pointer">
              <div class="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-stone-100 p-1 mb-4 group-hover:border-yellow-500 transition-colors shadow-sm">
                <img [src]="cat.image" class="w-full h-full rounded-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
              </div>
              <span class="text-xs uppercase tracking-widest font-bold text-stone-600 group-hover:text-stone-900">{{ cat.name }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- The Edit: Elegant Vertical Layout -->
    <section class="py-24 md:py-40 bg-white">
      <div class="max-w-[1920px] mx-auto px-6 md:px-24">
        
        <!-- Section Header -->
        <div class="flex flex-col items-center mb-20 text-center">
          <span class="font-cormorant italic text-3xl md:text-5xl text-stone-500 mb-4">The Seasonal</span>
          <h3 class="text-6xl md:text-9xl font-serif text-stone-900 tracking-tighter">Edit<span class="text-yellow-600">.</span></h3>
        </div>

        <!-- 3-Column Narrow Portrait Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          
          <!-- Column 1 -->
          <a routerLink="/products" class="group block cursor-pointer">
             <div class="relative w-full aspect-[3/5] overflow-hidden bg-stone-100 shadow-xl group-hover:shadow-2xl transition-all duration-500 rounded-sm">
               <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop" 
                    class="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105">
               
               <div class="absolute bottom-0 left-0 w-full text-center z-10 bg-gradient-to-t from-white via-white/90 to-transparent pt-20 pb-8 px-4">
                  <h4 class="text-4xl md:text-5xl font-serif italic text-stone-900 mb-3 drop-shadow-sm">Ready to Wear</h4>
                  <span class="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-stone-800 border-b-2 border-transparent group-hover:border-yellow-600 transition-colors pb-1">View Apparel</span>
               </div>
             </div>
          </a>

          <!-- Column 2 -->
          <a routerLink="/products" class="group block cursor-pointer md:pt-24">
             <div class="relative w-full aspect-[3/5] overflow-hidden bg-stone-100 shadow-xl group-hover:shadow-2xl transition-all duration-500 rounded-sm">
               <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop" 
                    class="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105">
               
               <div class="absolute bottom-0 left-0 w-full text-center z-10 bg-gradient-to-t from-white via-white/90 to-transparent pt-20 pb-8 px-4">
                  <h4 class="text-4xl md:text-5xl font-serif italic text-stone-900 mb-3 drop-shadow-sm">Fine Objects</h4>
                  <span class="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-stone-800 border-b-2 border-transparent group-hover:border-yellow-600 transition-colors pb-1">View Accessories</span>
               </div>
             </div>
          </a>

          <!-- Column 3 -->
          <a routerLink="/products" class="group block cursor-pointer">
             <div class="relative w-full aspect-[3/5] overflow-hidden bg-stone-100 shadow-xl group-hover:shadow-2xl transition-all duration-500 rounded-sm">
               <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000&auto=format&fit=crop" 
                    class="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105">
               
               <div class="absolute bottom-0 left-0 w-full text-center z-10 bg-gradient-to-t from-white via-white/90 to-transparent pt-20 pb-8 px-4">
                  <h4 class="text-4xl md:text-5xl font-serif italic text-stone-900 mb-3 drop-shadow-sm">Sanctuary</h4>
                  <span class="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-stone-800 border-b-2 border-transparent group-hover:border-yellow-600 transition-colors pb-1">View Home</span>
               </div>
             </div>
          </a>

        </div>
      </div>
    </section>

    <!-- Trust Signals -->
    <section class="py-20 md:py-32 bg-[#F9F9F9] text-stone-900 border-t border-stone-200">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        
        <!-- Signal 1 -->
        <div class="flex flex-col items-center justify-start p-8 group hover:bg-white rounded-xl transition-all hover:shadow-xl border border-transparent hover:border-stone-100">
           <div class="mb-6 text-stone-800 p-4 bg-white border border-stone-200 rounded-full shadow-sm group-hover:scale-110 transition-transform group-hover:border-yellow-500">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <h3 class="font-serif text-2xl mb-4 italic leading-tight text-stone-900">Personally Vetted</h3>
           <p class="text-sm font-bold text-stone-600 leading-relaxed max-w-xs">
              Every item is chosen by hand. No algorithms. Just honest curation.
           </p>
        </div>

        <!-- Signal 2 -->
        <div class="flex flex-col items-center justify-start p-8 group hover:bg-white rounded-xl transition-all hover:shadow-xl border border-transparent hover:border-stone-100">
           <div class="mb-6 text-stone-800 p-4 bg-white border border-stone-200 rounded-full shadow-sm group-hover:scale-110 transition-transform group-hover:border-yellow-500">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
           </div>
           <h3 class="font-serif text-2xl mb-4 italic leading-tight text-stone-900">Authentic Quality</h3>
           <p class="text-sm font-bold text-stone-600 leading-relaxed max-w-xs">
              We only partner with authorized retailers. Guaranteed authenticity.
           </p>
        </div>

        <!-- Signal 3 -->
        <div class="flex flex-col items-center justify-start p-8 group hover:bg-white rounded-xl transition-all hover:shadow-xl border border-transparent hover:border-stone-100">
           <div class="mb-6 text-stone-800 p-4 bg-white border border-stone-200 rounded-full shadow-sm group-hover:scale-110 transition-transform group-hover:border-yellow-500">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
           </div>
           <h3 class="font-serif text-2xl mb-4 italic leading-tight text-stone-900">Secure Checkout</h3>
           <p class="text-sm font-bold text-stone-600 leading-relaxed max-w-xs">
              Transactions are handled by trusted global platforms for your safety.
           </p>
        </div>

      </div>
    </section>
  `
})
export class HomeComponent implements OnDestroy {
  supabase = inject(SupabaseService);
  currentSlide = signal(0);
  intervalId: any;

  constructor() {
    this.intervalId = setInterval(() => {
      const total = this.supabase.heroSlides().length;
      if (total > 0) {
        this.currentSlide.update(c => (c + 1) % total);
      }
    }, 6000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
