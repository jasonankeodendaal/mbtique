import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#FDFBF7] flex items-center justify-center relative overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/abstract/1920/1080')] bg-cover animate-pulse-slow"></div>
      <div class="absolute inset-0 bg-white/60 backdrop-blur-md"></div>

      <div class="relative z-10 w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl shadow-stone-200 border border-white">
        <div class="text-center mb-10">
           <h2 class="text-3xl font-serif text-stone-900 tracking-widest mb-2">MAISON PORTAL</h2>
           <p class="text-[9px] uppercase tracking-[0.3em] text-stone-500 font-bold">Authorized Personnel Only</p>
        </div>
        
        <div class="space-y-6">
          <!-- Google Auth -->
          <button (click)="loginGoogle()" class="w-full bg-white text-stone-800 border border-stone-200 font-bold py-3 rounded-lg shadow-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-3">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5">
             <span class="text-xs uppercase tracking-widest">Sign in with Google</span>
          </button>
          
          <div class="relative flex items-center py-2">
             <div class="flex-grow border-t border-stone-200"></div>
             <span class="flex-shrink-0 mx-4 text-stone-300 text-[10px] uppercase font-bold">Or use Credentials</span>
             <div class="flex-grow border-t border-stone-200"></div>
          </div>

          <!-- Email/Pass Auth -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs uppercase tracking-widest text-stone-400 mb-2 font-bold">Email Address</label>
              <input type="email" [(ngModel)]="email" placeholder="admin@maison.com" class="w-full bg-stone-50 border border-stone-200 text-stone-800 px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white transition-all shadow-inner">
            </div>
            
            <div>
              <label class="block text-xs uppercase tracking-widest text-stone-400 mb-2 font-bold">Password</label>
              <input type="password" [(ngModel)]="password" (keyup.enter)="login()" placeholder="••••••••" class="w-full bg-stone-50 border border-stone-200 text-stone-800 px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white transition-all shadow-inner">
            </div>
          </div>

          <button (click)="login()" [disabled]="isLoading()" class="w-full bg-stone-900 text-white font-bold py-4 tracking-widest hover:bg-yellow-600 transition-colors rounded-lg shadow-lg text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading() ? 'Verifying...' : 'Enter Portal' }}
          </button>
          
          @if (errorMessage()) {
            <p class="text-red-500 text-xs text-center mt-4 uppercase tracking-widest bg-red-50 py-2 rounded animate-fade-in">{{ errorMessage() }}</p>
          }
        </div>
        
        <div class="mt-8 pt-6 border-t border-stone-100 text-center">
           <a routerLink="/" class="text-xs text-stone-400 hover:text-stone-800 transition-colors font-serif italic">Return to Main Site</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulseSlow { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.15; } }
    .animate-pulse-slow { animation: pulseSlow 8s infinite; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  supabase = inject(SupabaseService);
  // FIX: Explicitly type Router
  router: Router = inject(Router);
  
  email = '';
  password = '';
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  async login() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const { error } = await this.supabase.loginWithPassword(this.email, this.password);
    
    if (error) {
      this.errorMessage.set(error);
      this.isLoading.set(false);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  async loginGoogle() {
     await this.supabase.loginWithGoogle();
  }
}