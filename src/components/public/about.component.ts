
import { Component, inject, computed } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (pageData(); as data) {
      <!-- Editorial Hero -->
      <div class="pt-32 pb-16 px-6 max-w-[1920px] mx-auto text-center md:text-left bg-[#FDFBF7] text-stone-900">
         <h1 class="text-7xl md:text-[10rem] font-serif leading-[0.8] text-stone-900 opacity-100">
           The<br><span class="italic md:ml-20 text-yellow-600">Origin</span>
         </h1>
      </div>
  
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 relative">
         <!-- Sticky Bio Image -->
         <div class="md:col-span-5 relative">
            <div class="sticky top-32">
               <div class="relative overflow-hidden rounded-sm border-2 border-stone-200 shadow-xl">
                   <img [src]="supabase.settings()?.curatorImage" class="w-full aspect-[3/4] object-cover hover:scale-105 transition-all duration-1000">
               </div>
               <div class="absolute -bottom-6 -right-6 bg-white p-6 border border-stone-100 shadow-xl max-w-xs z-10 hidden md:block rounded-sm">
                  <p class="font-cormorant italic text-xl text-stone-600">"{{ supabase.settings()?.curatorBio }}"</p>
                  @if(data.metaData?.signatureImage) {
                    <div class="mt-4 border-t border-stone-100 pt-2">
                       <img [src]="data.metaData.signatureImage" class="h-12 opacity-80">
                    </div>
                  }
               </div>
            </div>
         </div>
  
         <!-- Content -->
         <div class="md:col-span-1 md:col-start-7 md:col-end-13 pt-0 md:pt-12">
            <h2 class="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-stone-400">{{ data.introText }}</h2>
            
            <div class="prose prose-lg text-stone-800 font-serif whitespace-pre-line leading-relaxed">
               {{ data.bodyContent }}
            </div>
         </div>
      </div>
  
      <!-- Values Grid -->
      <div class="bg-stone-900 text-white py-24">
         <div class="max-w-7xl mx-auto px-6">
            <h2 class="text-3xl font-serif text-center mb-16 italic text-stone-200">Our Core Values</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
               @for (val of data.metaData?.values || []; track val.title) {
                 <div class="text-center p-8 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors">
                    <h3 class="text-xl font-bold uppercase tracking-widest mb-4 text-yellow-500">{{ val.title }}</h3>
                    <p class="font-cormorant text-xl text-stone-300">{{ val.desc }}</p>
                 </div>
               }
            </div>
         </div>
      </div>
      
      <!-- Gallery -->
      @if (data.metaData?.galleryImages) {
        <div class="max-w-[1920px] mx-auto px-6 py-32 bg-[#FDFBF7]">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @for (img of data.metaData.galleryImages; track img; let i = $index) {
                   <div class="aspect-[3/4] overflow-hidden" [class.mt-12]="i % 2 !== 0">
                      <img [src]="img" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
                   </div>
                }
            </div>
        </div>
      }
    }
  `
})
export class AboutComponent {
  supabase = inject(SupabaseService);
  
  pageData = computed(() => this.supabase.getPageContent('about'));
}
