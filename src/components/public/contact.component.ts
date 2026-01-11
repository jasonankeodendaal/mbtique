import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    @if (pageData(); as data) {
      <div class="min-h-screen bg-[#FDFBF7] text-neutral-800 relative overflow-hidden font-sans">
        
        <div class="pt-32 pb-16 text-center relative z-10 px-6">
           <span class="block text-[10px] uppercase tracking-[0.4em] text-yellow-600 font-bold mb-4 animate-fade-up">{{ data.introText }}</span>
           <h1 class="text-5xl md:text-7xl font-serif text-neutral-900 mb-6 italic animate-fade-up">{{ data.title }}</h1>
        </div>
  
        <div class="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative z-10">
          
          <!-- Image -->
          <div class="lg:col-span-5 flex flex-col gap-8 animate-fade-up">
             <div class="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg">
                <img [src]="data.heroImage" class="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105">
                <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/60 to-transparent text-white rounded-b-3xl">
                    <h3 class="font-serif text-2xl italic mb-1">{{ supabase.settings()?.siteName }} HQ</h3>
                    <p class="text-xs uppercase tracking-widest opacity-90">{{ data.metaData?.locationText }}</p>
                </div>
             </div>
             <p class="font-serif italic text-stone-600 text-lg leading-relaxed">{{ data.bodyContent }}</p>
          </div>
  
          <!-- Form -->
          <div class="lg:col-span-7">
             <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-50 h-full relative overflow-hidden">
               <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-8 relative z-10">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="group">
                     <label class="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 pl-2">Your Name</label>
                     <input formControlName="name" type="text" class="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-6 py-4 text-neutral-900 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all font-serif placeholder-neutral-300">
                   </div>
                   <div class="group">
                     <label class="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 pl-2">Email Address</label>
                     <input formControlName="email" type="email" class="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-6 py-4 text-neutral-900 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all font-serif placeholder-neutral-300">
                   </div>
                 </div>
                 <div class="group">
                   <label class="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 pl-2">Subject</label>
                   <select formControlName="subject" class="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-6 py-4 text-neutral-900 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all font-serif appearance-none cursor-pointer">
                      <option value="" disabled selected>Kindly select a topic...</option>
                      <option value="Curator Application">Curator Application</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Partnership">Brand Partnership</option>
                   </select>
                 </div>
                 <div class="group">
                   <label class="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 pl-2">Message</label>
                   <textarea formControlName="message" rows="5" class="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-6 py-4 text-neutral-900 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all font-serif placeholder-neutral-300 resize-none leading-relaxed"></textarea>
                 </div>
                 <div class="pt-4">
                   <button type="submit" [disabled]="form.invalid || sent" class="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-neutral-900 text-white rounded-xl overflow-hidden transition-all hover:bg-neutral-800 hover:shadow-lg disabled:opacity-50">
                      <span class="relative z-10 text-xs uppercase tracking-[0.2em] font-bold">
                        {{ sent ? 'Message Sent' : 'Send Message' }}
                      </span>
                   </button>
                 </div>
               </form>
             </div>
          </div>
        </div>
  
        <!-- FAQ -->
        <div class="max-w-4xl mx-auto px-6 pb-32">
          <h2 class="text-3xl font-serif text-center mb-12 italic text-stone-800">Frequently Asked</h2>
          <div class="space-y-4">
            @for (faq of data.metaData?.faq || []; track faq.q; let i = $index) {
              <div class="border border-stone-200 rounded-lg bg-white overflow-hidden">
                 <button (click)="toggleFaq(i)" class="w-full flex justify-between items-center p-6 text-left">
                    <span class="text-sm font-bold uppercase tracking-widest text-stone-700">{{ faq.q }}</span>
                    <span class="text-2xl text-stone-400 transition-transform" [class.rotate-45]="openFaq() === i">+</span>
                 </button>
                 @if (openFaq() === i) {
                   <div class="px-6 pb-6 pt-0 animate-fade-in">
                      <p class="font-cormorant text-xl text-stone-600 italic leading-relaxed">{{ faq.a }}</p>
                   </div>
                 }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ContactComponent {
  supabase = inject(SupabaseService);
  // FIX: Explicitly type FormBuilder
  fb: FormBuilder = inject(FormBuilder);
  
  pageData = computed(() => this.supabase.getPageContent('contact'));
  
  sent = false;
  openFaq = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  submit() {
    if (this.form.valid) {
      this.supabase.sendMessage(this.form.value as any);
      this.sent = true;
      this.form.disable();
    }
  }

  toggleFaq(index: number) {
    this.openFaq.set(this.openFaq() === index ? null : index);
  }
}