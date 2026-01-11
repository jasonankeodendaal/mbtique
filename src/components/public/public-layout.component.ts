
import { Component, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ChildrenOutletContexts, Router, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { magazineFlip } from '../../app.animations';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  animations: [magazineFlip],
  template: `
    @switch (supabase.systemStatus()) {
      
      <!-- STATE: INITIALIZING / SEEDING -->
      @case ('INITIALIZING') {
        <ng-container *ngTemplateOutlet]="loadingTpl"></ng-container>
      }
      @case ('SEEDING') {
        <ng-container *ngTemplateOutlet]="loadingTpl"></ng-container>
      }

      <!-- STATE: MISSING KEYS (System Setup) -->
      @case ('MISSING_KEYS') {
        <div class="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center z-50">
           <h1 class="text-4xl md:text-6xl font-serif text-stone-900 mb-6 italic">System Setup Required</h1>
           <p class="text-stone-600 mb-12 max-w-lg font-cormorant text-xl md:text-2xl leading-relaxed">
             The architecture requires a direct link to the Supabase data vault to function.
           </p>
           
           <div class="bg-white p-8 rounded-lg shadow-xl border border-stone-200 max-w-2xl w-full text-left relative overflow-hidden">
             <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-yellow-500"></div>
             <p class="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Missing Configuration
             </p>
             
             <div class="space-y-4 mb-8">
               <p class="text-sm font-bold text-stone-700">Environment Variables Missing:</p>
               <div class="bg-stone-900 text-stone-300 p-6 rounded-md font-mono text-xs md:text-sm overflow-x-auto shadow-inner">
                 <span class="text-green-400">SUPABASE_URL</span>=your_project_url<br>
                 <span class="text-green-400">SUPABASE_KEY</span>=your_public_anon_key
               </div>
             </div>
             
             <p class="text-sm text-stone-500 italic border-t border-stone-100 pt-4">
                Please add these keys to your .env file or Vercel Deployment Settings to initialize the bridge.
             </p>
           </div>
        </div>
      }

      <!-- STATE: CONNECTION ERROR -->
      @case ('CONNECTION_ERROR') {
         <div class="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center z-50">
            <div class="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
               <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 class="text-3xl font-serif text-stone-900 mb-2">Connection Failed</h2>
            <p class="text-stone-500 mb-8 max-w-md">{{ supabase.connectionError() || 'Unable to reach the Supabase vault.' }}</p>
            <button (click)="reload()" class="bg-stone-900 text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors">Retry Connection</button>
         </div>
      }

      <!-- STATE: READY -->
      @case ('READY') {
        <!-- Public Application Shell -->
        <div class="min-h-screen flex flex-col relative bg-main-bg text-stone-800 overflow-x-hidden">
          
          <!-- Navbar -->
          <nav class="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md transition-all duration-300 border-b border-stone-200 shadow-sm">
            <div class="max-w-[1920px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
              
              <!-- Mobile Menu Button -->
              <button (click)="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-stone-900 hover:text-accent transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
  
              <!-- Logo -->
              <a routerLink="/" class="text-2xl md:text-3xl font-heading tracking-[0.15em] font-bold text-stone-900 uppercase hover:text-accent transition-colors">
                {{ supabase.settings()?.siteName }}<span class="text-accent">.</span>
              </a>
  
              <!-- Desktop Links -->
              <div class="hidden md:flex space-x-12 text-xs tracking-[0.2em] uppercase font-bold text-stone-600">
                <a routerLink="/" routerLinkActive="text-stone-900 border-b-2 border-accent" [routerLinkActiveOptions]="{exact: true}" class="hover:text-stone-900 hover:text-accent transition-colors py-1">Home</a>
                <a routerLink="/products" routerLinkActive="text-stone-900 border-b-2 border-accent" class="hover:text-stone-900 hover:text-accent transition-colors py-1">The Edit</a>
                <a routerLink="/about" routerLinkActive="text-stone-900 border-b-2 border-accent" class="hover:text-stone-900 hover:text-accent transition-colors py-1">My Story</a>
                <a routerLink="/contact" routerLinkActive="text-stone-900 border-b-2 border-accent" class="hover:text-stone-900 hover:text-accent transition-colors py-1">Connect</a>
              </div>
  
              <!-- Actions -->
              <div class="flex items-center space-x-6">
                <a routerLink="/products" class="text-stone-900 hover:text-accent transition-colors relative group p-1">
                  <span class="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </a>
              </div>
            </div>
  
            <!-- Mobile Menu Overlay -->
            @if (mobileMenuOpen) {
              <div class="md:hidden absolute top-24 left-0 w-full bg-[#FDFBF7] border-b border-stone-200 p-8 flex flex-col space-y-6 shadow-xl animate-fade-up z-50">
                <a (click)="mobileMenuOpen = false" routerLink="/" class="text-3xl font-heading text-stone-900 font-bold hover:text-accent">Home</a>
                <a (click)="mobileMenuOpen = false" routerLink="/products" class="text-3xl font-heading text-stone-900 font-bold hover:text-accent">The Edit</a>
                <a (click)="mobileMenuOpen = false" routerLink="/about" class="text-3xl font-heading text-stone-900 font-bold hover:text-accent">My Story</a>
                <a (click)="mobileMenuOpen = false" routerLink="/contact" class="text-3xl font-heading text-stone-900 font-bold hover:text-accent">Connect</a>
              </div>
            }
          </nav>
  
          <!-- Main Content -->
          <main class="flex-grow pt-24 relative w-full overflow-x-hidden" [@routeAnimations]="getRouteAnimationData()">
            <router-outlet></router-outlet>
          </main>
  
          <!-- Footer -->
          <footer class="bg-white text-stone-600 py-16 md:py-24 border-t border-stone-200 relative z-30">
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              
              <div class="col-span-2 md:col-span-2">
                <h3 class="text-stone-900 text-3xl font-heading tracking-wider mb-4 md:mb-6 font-bold">{{ supabase.settings()?.siteName }}<span class="text-accent">.</span></h3>
                <p class="font-cormorant italic text-xl text-stone-700 max-w-sm">
                  Curating the exceptional. Quality over quantity. Style that transcends trends.
                </p>
                
                <!-- Social Links -->
                <div class="flex gap-4 mt-8">
                   @if(supabase.settings()?.socialInstagram) {
                     <a [href]="supabase.settings()?.socialInstagram" target="_blank" class="text-stone-500 hover:text-accent transition-colors" title="Instagram">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                     </a>
                   }
                </div>
              </div>
  
              <!-- Footer Links -->
              <div class="col-span-1">
                <h4 class="text-stone-900 uppercase text-[10px] tracking-[0.2em] mb-6 font-bold">Discover</h4>
                <ul class="space-y-4 text-xs md:text-sm font-bold uppercase tracking-widest text-stone-600">
                  <li><a routerLink="/products" class="hover:text-stone-900 transition-colors">The Edit</a></li>
                  <li><a routerLink="/about" class="hover:text-stone-900 transition-colors">Curator's Note</a></li>
                </ul>
              </div>
              
              <div class="col-span-1">
                <h4 class="text-stone-900 uppercase text-[10px] tracking-[0.2em] mb-6 font-bold">Legal</h4>
                <ul class="space-y-4 text-xs md:text-sm font-bold uppercase tracking-widest text-stone-600">
                  <li><a routerLink="/terms" fragment="terms" class="hover:text-stone-900 transition-colors">Terms of Service</a></li>
                  <li><a routerLink="/terms" fragment="privacy" class="hover:text-stone-900 transition-colors">Privacy Policy</a></li>
                  <li><a routerLink="/terms" fragment="affiliate" class="hover:text-stone-900 transition-colors">Affiliate Disclosure</a></li>
                </ul>
              </div>
            </div>
            
            <div class="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-xs font-medium tracking-wide text-stone-500">
               <span>&copy; 2024 {{ supabase.settings()?.siteName }}. All rights reserved.</span>
               <span class="mt-2 md:mt-0 font-cormorant italic text-sm text-stone-600">Affiliate Disclosure: Curated selections may earn us a commission.</span>
            </div>
            
            <!-- Discreet Admin Access -->
            <div class="flex justify-center mt-12 gap-4 items-center">
               <a routerLink="/login" class="text-[9px] uppercase tracking-widest text-stone-400 hover:text-accent transition-all font-bold">Portal Access</a>
            </div>
          </footer>
  
        </div>
      }
    }

    <!-- LOADING TEMPLATE -->
    <ng-template #loadingTpl>
      <div class="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center text-stone-900 z-50">
        <div class="flex flex-col items-center max-w-md text-center px-6">
          <h2 class="text-5xl font-serif tracking-[0.2em] mb-4 text-stone-900">MAISON</h2>
          <div class="w-16 h-1 bg-yellow-600 mb-8"></div>
           <p class="font-cormorant italic text-2xl text-stone-700 mb-4 animate-pulse">
              {{ supabase.seedingStatus() || 'Initializing Portal...' }}
           </p>
           <div class="w-64 h-1 bg-stone-200 rounded-full overflow-hidden">
             <div class="h-full bg-stone-900 animate-[width_2s_ease-in-out_infinite] w-full origin-left"></div>
           </div>
        </div>
      </div>
    </ng-template>
  `
})
export class PublicLayoutComponent {
  supabase = inject(SupabaseService);
  contexts: ChildrenOutletContexts = inject(ChildrenOutletContexts);
  router: Router = inject(Router);
  mobileMenuOpen = false;

  constructor() {
    // 1. Theme Engine Logic
    effect(() => {
        const settings = this.supabase.settings();
        if (settings) {
            const root = document.documentElement;
            // Apply Colors
            root.style.setProperty('--color-accent', settings.themePrimaryColor || '#d97706');
            // Apply Fonts
            root.style.setProperty('--font-heading', settings.themeFontHeading || 'Playfair Display');
            root.style.setProperty('--font-body', settings.themeFontBody || 'Lato');
        }
    });

    // 2. Traffic Tracking
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
        this.supabase.trackEvent('page_view', event.urlAfterRedirects);
    });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  
  reload() {
    window.location.reload();
  }
}
