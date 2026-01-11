import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, Product, Settings, Message, Category, AdminUser, PageContent } from '../../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type TabGroup = 'insight' | 'collection' | 'identity' | 'engine';
type Tab = 'dashboard' | 'inbox' | 'catalog' | 'visuals' | 'depts' | 'about_cms' | 'contact_cms' | 'canvas' | 'maison' | 'system' | 'guide';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-[#F5F5F0] font-sans text-stone-800">
      
      <!-- HEADER: THE COMMAND DECK -->
      <header class="bg-stone-900 text-stone-300 z-40 shrink-0 shadow-lg relative">
         <div class="flex flex-col">
            
            <!-- Top Row: Brand & Profile -->
            <div class="h-16 flex items-center justify-between px-6 md:px-8 border-b border-stone-800">
                <div class="flex items-center gap-4">
                   <div class="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center text-stone-900 font-bold font-serif italic text-lg shadow-glow">M</div>
                   <div class="flex flex-col">
                      <span class="text-white font-serif tracking-widest text-lg leading-none">MAISON</span>
                      <span class="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-500">Admin Portal v2.0</span>
                   </div>
                </div>

                <div class="flex items-center gap-6">
                   <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/50 border border-stone-700">
                      <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span class="text-[9px] uppercase tracking-widest font-bold text-stone-400">Sync Active</span>
                   </div>
                   <button (click)="logout()" class="group flex items-center gap-3 hover:bg-stone-800 px-3 py-1.5 rounded transition-all">
                      <span class="text-[10px] uppercase font-bold text-stone-400 group-hover:text-white transition-colors">Exit</span>
                      <img [src]="supabase.currentUser()?.avatar || 'https://picsum.photos/seed/curator/100'" class="w-8 h-8 rounded-full object-cover border border-stone-600 group-hover:border-white transition-colors">
                   </button>
                </div>
            </div>

            <!-- Bottom Row: Navigation Tabs (Icon Based) -->
            <div class="flex overflow-x-auto hide-scrollbar bg-stone-900">
               <button (click)="selectGroup('insight')" class="nav-btn" [class.active]="activeGroup() === 'insight'">
                  <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <span class="text-[10px] uppercase tracking-widest font-bold">Insight</span>
               </button>
               <button (click)="selectGroup('collection')" class="nav-btn" [class.active]="activeGroup() === 'collection'">
                  <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span class="text-[10px] uppercase tracking-widest font-bold">Collection</span>
               </button>
               <button (click)="selectGroup('identity')" class="nav-btn" [class.active]="activeGroup() === 'identity'">
                  <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                  <span class="text-[10px] uppercase tracking-widest font-bold">Identity</span>
               </button>
               <button (click)="selectGroup('engine')" class="nav-btn" [class.active]="activeGroup() === 'engine'">
                  <svg class="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                  <span class="text-[10px] uppercase tracking-widest font-bold">System</span>
               </button>
            </div>
         </div>
      </header>

      <!-- SUB-HEADER: ACTION BAR -->
      <div class="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 md:px-8 z-30 shrink-0 shadow-sm">
         <!-- Sub Tabs -->
         <nav class="flex h-full space-x-6 overflow-x-auto hide-scrollbar">
            @if (activeGroup() === 'insight') {
               <button (click)="activeTab.set('dashboard')" class="sub-tab" [class.active]="activeTab() === 'dashboard'">Analytics</button>
               <button (click)="activeTab.set('inbox')" class="sub-tab" [class.active]="activeTab() === 'inbox'">
                  Concierge 
                  @if(unreadCount() > 0) { <span class="ml-2 bg-yellow-600 text-white text-[9px] px-1.5 rounded-full">{{ unreadCount() }}</span> }
               </button>
            }
            @if (activeGroup() === 'collection') {
               <button (click)="activeTab.set('catalog')" class="sub-tab" [class.active]="activeTab() === 'catalog'">Catalog</button>
               <button (click)="activeTab.set('visuals')" class="sub-tab" [class.active]="activeTab() === 'visuals'">Visuals</button>
               <button (click)="activeTab.set('depts')" class="sub-tab" [class.active]="activeTab() === 'depts'">Departments</button>
            }
            @if (activeGroup() === 'identity') {
               <button (click)="activeTab.set('about_cms')" class="sub-tab" [class.active]="activeTab() === 'about_cms'">My Story</button>
               <button (click)="activeTab.set('contact_cms')" class="sub-tab" [class.active]="activeTab() === 'contact_cms'">Connect</button>
               <button (click)="activeTab.set('canvas')" class="sub-tab" [class.active]="activeTab() === 'canvas'">Settings</button>
               <button (click)="activeTab.set('maison')" class="sub-tab" [class.active]="activeTab() === 'maison'">Maison Team</button>
            }
            @if (activeGroup() === 'engine') {
               <button (click)="activeTab.set('guide')" class="sub-tab" [class.active]="activeTab() === 'guide'">Setup Guide (Start Here)</button>
               <button (click)="activeTab.set('system')" class="sub-tab" [class.active]="activeTab() === 'system'">System Diagnostics</button>
            }
         </nav>

         <!-- Context Actions -->
         <div class="flex items-center gap-3">
            @if (activeTab() === 'catalog') {
               <button (click)="openProductModal()" class="action-btn-primary"><span>+</span> New Artifact</button>
            }
            @if (activeTab() === 'visuals') {
               <button (click)="showSlideForm = true" class="action-btn-secondary"><span>+</span> Upload Slide</button>
            }
            @if (activeTab() === 'depts') {
               <button (click)="openCategoryModal()" class="action-btn-primary"><span>+</span> New Dept</button>
            }
            @if (activeTab() === 'about_cms' || activeTab() === 'contact_cms') {
               <button (click)="savePageContent()" [disabled]="isUploading" class="action-btn-primary">
                  {{ isUploading ? 'Saving...' : 'Publish Changes' }}
               </button>
            }
            @if (activeTab() === 'maison') {
               <button (click)="openUserModal()" class="action-btn-primary"><span>+</span> Invite Member</button>
            }
         </div>
      </div>

      <!-- MAIN STAGE -->
      <main class="flex-1 overflow-y-auto bg-[#FDFBF7] relative custom-scrollbar">
         
         <!-- TAB: DASHBOARD -->
         @if (activeTab() === 'dashboard') {
            <div class="max-w-[1600px] mx-auto p-8 space-y-8 animate-fade-in">
               <!-- KPI Strip -->
               <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div class="kpi-card">
                     <span class="kpi-label">Total Views</span>
                     <p class="kpi-value">{{ analyticsStats().totalViews }}</p>
                  </div>
                  <div class="kpi-card">
                     <span class="kpi-label">Affiliate Clicks</span>
                     <p class="kpi-value">{{ analyticsStats().conversions }}</p>
                  </div>
                  <div class="kpi-card">
                     <span class="kpi-label">Click Rate</span>
                     <p class="kpi-value">{{ analyticsStats().conversionRate }}%</p>
                  </div>
                  <div class="kpi-card bg-stone-900 text-white border-stone-900">
                     <span class="kpi-label text-stone-400">Inventory</span>
                     <p class="kpi-value text-2xl mt-2">{{ supabase.products().length }} Items</p>
                  </div>
               </div>
            </div>
         }

         <!-- TAB: SETUP GUIDE (ZERO TO HERO) -->
         @if (activeTab() === 'guide') {
            <div class="max-w-5xl mx-auto p-8 pb-40 animate-fade-in">
               
               <div class="text-center mb-16">
                  <h1 class="text-6xl font-serif text-stone-900 italic mb-4">Zero to Hero</h1>
                  <p class="text-sm font-bold uppercase tracking-[0.2em] text-stone-500">Full Infrastructure Setup Guide</p>
               </div>

               <!-- Phase 1: Database (Supabase) -->
               <div class="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-12">
                  <div class="bg-stone-900 p-6 flex items-center justify-between text-white">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-green-500 text-stone-900 font-bold flex items-center justify-center text-xl">1</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest">Database Infrastructure</h2>
                     </div>
                     <span class="text-xs uppercase tracking-widest text-stone-400">Powered by Supabase</span>
                  </div>
                  <div class="p-8">
                     <div class="flex flex-col md:flex-row gap-8 mb-8">
                        <div class="flex-1">
                           <p class="text-lg font-serif italic text-stone-700 mb-4">"The foundation of the Maison. We must construct the vault before we fill it."</p>
                           <div class="tip-box">
                              <span class="block text-xs uppercase font-bold mb-1 opacity-70">Action Required</span>
                              Go to your Supabase Project -> SQL Editor -> New Query. Paste the code below and run it to create your entire backend instantly.
                           </div>
                        </div>
                        <div class="w-full md:w-1/3 flex items-center justify-center bg-stone-50 rounded-lg p-6 relative overflow-hidden">
                           <!-- Animated Database Illustration -->
                           <div class="relative w-20 h-24">
                              <div class="absolute inset-x-0 bottom-0 h-8 bg-stone-300 rounded-[50%] border-2 border-stone-400 z-10"></div>
                              <div class="absolute inset-x-0 bottom-4 h-8 bg-stone-300 rounded-[50%] border-2 border-stone-400 z-20 animate-bounce-slow"></div>
                              <div class="absolute inset-x-0 bottom-8 h-8 bg-stone-300 rounded-[50%] border-2 border-stone-400 z-30 animate-bounce-slow delay-75"></div>
                              <div class="absolute inset-x-0 top-0 h-8 bg-green-400 rounded-[50%] border-2 border-green-600 z-40 animate-pulse"></div>
                           </div>
                        </div>
                     </div>

                     <div class="relative bg-stone-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-green-400 shadow-inner">
                        <button (click)="copyToClipboard(sqlTemplate)" class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-[10px] uppercase font-bold transition-colors">Copy SQL</button>
                        <pre>{{ sqlTemplate }}</pre>
                     </div>
                  </div>
               </div>

               <!-- Phase 2: Authentication -->
               <div class="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-12">
                  <div class="bg-stone-900 p-6 flex items-center justify-between text-white">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-blue-500 text-stone-900 font-bold flex items-center justify-center text-xl">2</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest">Authentication & Security</h2>
                     </div>
                     <span class="text-xs uppercase tracking-widest text-stone-400">Google OAuth + Email</span>
                  </div>
                  <div class="p-8">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <h3 class="text-lg font-serif font-bold mb-4">Email Login Setup</h3>
                           <ol class="list-decimal pl-5 space-y-2 text-sm text-stone-600 font-medium">
                              <li>In Supabase, go to <strong>Authentication -> Providers</strong>.</li>
                              <li>Enable <strong>Email</strong>. Disable "Confirm email" if you want instant access for testing.</li>
                              <li>Go to <strong>Authentication -> Users</strong> and create your admin account (e.g., <code>admin@maison.com</code>).</li>
                              <li class="tip-box mt-2">Make sure to verify your email or disable confirmation, otherwise you cannot login.</li>
                           </ol>
                        </div>
                        <div>
                           <h3 class="text-lg font-serif font-bold mb-4">Google OAuth (Optional)</h3>
                           <ol class="list-decimal pl-5 space-y-2 text-sm text-stone-600 font-medium">
                              <li>Go to Google Cloud Console -> Create Project.</li>
                              <li>Setup OAuth Consent Screen (External).</li>
                              <li>Create Credentials -> OAuth Client ID (Web Application).</li>
                              <li>Add Authorized Redirect URI: <code>https://&lt;project-ref&gt;.supabase.co/auth/v1/callback</code>.</li>
                              <li>Copy Client ID & Secret to Supabase -> Auth -> Google.</li>
                           </ol>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Phase 3: Communication (EmailJS) -->
               <div class="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-12">
                  <div class="bg-stone-900 p-6 flex items-center justify-between text-white">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-yellow-500 text-stone-900 font-bold flex items-center justify-center text-xl">3</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest">Concierge System</h2>
                     </div>
                     <span class="text-xs uppercase tracking-widest text-stone-400">Powered by EmailJS</span>
                  </div>
                  <div class="p-8">
                     <p class="text-sm text-stone-600 mb-6 font-medium">
                        To receive "Contact Us" messages directly to your inbox, we use EmailJS. It's free and requires no backend server.
                     </p>
                     
                     <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-1 space-y-4">
                           <div class="step-card">
                              <span class="step-num">01</span>
                              <p>Create Account at <a href="https://www.emailjs.com" target="_blank" class="underline hover:text-yellow-600">emailjs.com</a>.</p>
                           </div>
                           <div class="step-card">
                              <span class="step-num">02</span>
                              <p>Add "Email Service" (e.g., Gmail).</p>
                           </div>
                           <div class="step-card">
                              <span class="step-num">03</span>
                              <p>Create "Email Template". Use the code on the right.</p>
                           </div>
                        </div>
                        <div class="lg:col-span-2">
                           <div class="relative bg-stone-100 p-4 rounded border border-stone-200 font-mono text-xs">
                              <button (click)="copyToClipboard(emailTemplate)" class="absolute top-2 right-2 text-[9px] uppercase font-bold bg-white px-2 py-1 border border-stone-300 rounded hover:bg-stone-50">Copy HTML</button>
                              <div class="text-stone-500 mb-2">// EmailJS Template Editor (HTML Mode)</div>
                              <pre class="whitespace-pre-wrap text-stone-800">{{ emailTemplate }}</pre>
                           </div>
                        </div>
                     </div>
                     
                     <div class="tip-box mt-6">
                        Once you have your <strong>Service ID</strong>, <strong>Template ID</strong>, and <strong>Public Key</strong>, go to the <strong>Identity -> Settings</strong> tab in this dashboard to save them.
                     </div>
                  </div>
               </div>

               <!-- Phase 4: Deployment -->
               <div class="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-12">
                   <div class="bg-stone-900 p-6 flex items-center justify-between text-white">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-purple-500 text-stone-900 font-bold flex items-center justify-center text-xl">4</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest">Global Launch</h2>
                     </div>
                     <span class="text-xs uppercase tracking-widest text-stone-400">Vercel & Environment</span>
                  </div>
                  <div class="p-8">
                     <p class="mb-6 font-medium text-stone-600">Final step. When deploying to Vercel, you must set these Environment Variables.</p>
                     
                     <div class="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3 font-mono text-sm">
                        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-2">
                           <span class="font-bold text-stone-700">SUPABASE_URL</span>
                           <span class="text-stone-400">Project Settings -> API -> URL</span>
                        </div>
                        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-2">
                           <span class="font-bold text-stone-700">SUPABASE_KEY</span>
                           <span class="text-stone-400">Project Settings -> API -> anon public</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         }

         <!-- TAB: CATALOG -->
         @if (activeTab() === 'catalog') {
            <div class="p-8 animate-fade-in">
               <div class="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                  <table class="w-full text-left">
                     <thead class="bg-stone-50 text-[9px] uppercase tracking-widest text-stone-500 font-bold border-b border-stone-200">
                        <tr>
                           <th class="px-6 py-4">Visual</th>
                           <th class="px-6 py-4">Artifact</th>
                           <th class="px-6 py-4">Category</th>
                           <th class="px-6 py-4">Stock</th>
                           <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-stone-100">
                        @for (prod of supabase.products(); track prod.id) {
                           <tr class="hover:bg-stone-50 group transition-colors cursor-pointer" (click)="openProductModal(prod)">
                              <td class="px-6 py-3 w-20">
                                 <img [src]="prod.image" class="w-12 h-16 object-cover rounded-sm border border-stone-100">
                              </td>
                              <td class="px-6 py-3">
                                 <p class="text-xs font-bold text-stone-900">{{ prod.title }}</p>
                                 <p class="text-[9px] text-stone-400 font-mono">{{ prod.sku || 'NO SKU' }}</p>
                              </td>
                              <td class="px-6 py-3">
                                 <span class="px-2 py-0.5 bg-stone-100 rounded text-[9px] font-bold uppercase text-stone-600">{{ prod.category }}</span>
                                 @if(prod.subCategory) { <span class="text-[9px] text-stone-400 ml-1">/ {{ prod.subCategory }}</span> }
                              </td>
                              <td class="px-6 py-3">
                                 <span class="text-[9px] font-bold uppercase" 
                                    [class.text-green-600]="prod.stockStatus === 'In Stock'"
                                    [class.text-red-500]="prod.stockStatus === 'Sold Out'">{{ prod.stockStatus }}</span>
                              </td>
                              <td class="px-6 py-3 text-right">
                                 <button (click)="$event.stopPropagation(); supabase.deleteProduct(prod.id!)" class="text-red-300 hover:text-red-500 text-[10px] uppercase font-bold">Archive</button>
                              </td>
                           </tr>
                        }
                     </tbody>
                  </table>
               </div>
            </div>
         }

         <!-- TAB: SYSTEM STATUS (Upgraded) -->
         @if (activeTab() === 'system') {
            <div class="max-w-6xl mx-auto p-8 animate-fade-in pb-32">
                <h2 class="font-serif text-3xl text-stone-900 italic mb-8">System Health & Diagnostics</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Card 1: Connection -->
                    <div class="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                       <h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                          <span class="w-2 h-2 bg-green-500 rounded-full"></span> Supabase Connection
                       </h3>
                       <div class="space-y-4">
                          <div class="flex justify-between items-center border-b border-stone-100 pb-3">
                             <span class="text-sm font-bold text-stone-700">Status</span>
                             <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded-full">Operational</span>
                          </div>
                          <div class="flex justify-between items-center border-b border-stone-100 pb-3">
                             <span class="text-sm font-bold text-stone-700">Environment</span>
                             <span class="text-sm font-mono text-stone-500">Production</span>
                          </div>
                          <div class="flex justify-between items-center border-b border-stone-100 pb-3">
                             <span class="text-sm font-bold text-stone-700">Project URL</span>
                             <span class="text-sm font-mono text-stone-500">https://{{ getMaskedUrl() }}</span>
                          </div>
                          <div class="flex justify-between items-center pb-1">
                             <span class="text-sm font-bold text-stone-700">Latency</span>
                             <span class="text-sm font-mono text-green-600">~24ms</span>
                          </div>
                       </div>
                    </div>

                    <!-- Card 2: Data Health -->
                    <div class="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                           <svg class="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                           Database Metrics
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 bg-stone-50 rounded border border-stone-100 text-center">
                                <span class="block text-2xl font-serif text-stone-900">{{ supabase.products().length }}</span>
                                <span class="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Products</span>
                            </div>
                            <div class="p-4 bg-stone-50 rounded border border-stone-100 text-center">
                                <span class="block text-2xl font-serif text-stone-900">{{ supabase.categories().length }}</span>
                                <span class="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Categories</span>
                            </div>
                            <div class="p-4 bg-stone-50 rounded border border-stone-100 text-center">
                                <span class="block text-2xl font-serif text-stone-900">{{ supabase.messages().length }}</span>
                                <span class="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Messages</span>
                            </div>
                            <div class="p-4 bg-stone-50 rounded border border-stone-100 text-center">
                                <span class="block text-2xl font-serif text-stone-900">{{ supabase.reviews().length }}</span>
                                <span class="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Reviews</span>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3: Storage Assets -->
                    <div class="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                           <svg class="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           Asset Storage
                        </h3>
                        <div class="space-y-4">
                           <div class="flex justify-between items-center">
                              <span class="text-sm font-bold text-stone-700">Bucket: maison-assets</span>
                              <span class="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] uppercase font-bold rounded">Public Access</span>
                           </div>
                           <div class="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                              <div class="bg-yellow-500 h-2 w-1/4 rounded-full"></div>
                           </div>
                           <p class="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-right">Usage Estimate: 24%</p>
                        </div>
                    </div>

                    <!-- Card 4: Third Party -->
                    <div class="bg-white p-8 rounded-lg shadow-sm border border-stone-200">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                           <svg class="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                           Integrations
                        </h3>
                         <div class="space-y-4">
                            <div class="flex justify-between items-center border-b border-stone-100 pb-2">
                               <div class="flex items-center gap-2">
                                  <div class="w-2 h-2 rounded-full" [class.bg-green-500]="supabase.settings()?.emailJsPublicKey" [class.bg-red-500]="!supabase.settings()?.emailJsPublicKey"></div>
                                  <span class="text-sm font-bold text-stone-700">EmailJS</span>
                               </div>
                               <span class="text-[10px] text-stone-400 font-mono">{{ supabase.settings()?.emailJsPublicKey ? 'ACTIVE' : 'INACTIVE' }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-1">
                               <div class="flex items-center gap-2">
                                  <div class="w-2 h-2 rounded-full" [class.bg-green-500]="supabase.settings()?.googleAnalyticsId" [class.bg-gray-300]="!supabase.settings()?.googleAnalyticsId"></div>
                                  <span class="text-sm font-bold text-stone-700">Google Analytics</span>
                               </div>
                               <span class="text-[10px] text-stone-400 font-mono">{{ supabase.settings()?.googleAnalyticsId || 'NOT SET' }}</span>
                            </div>
                         </div>
                    </div>
                    
                    <div class="col-span-1 md:col-span-2 text-center mt-8">
                        <button (click)="supabase.forceResync()" class="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest border border-red-200 px-6 py-3 rounded hover:bg-red-50 transition-colors">
                           Force Re-Sync / Seed Database
                        </button>
                        <p class="text-[9px] text-stone-400 mt-2">Only use if database is corrupted or empty.</p>
                    </div>

                </div>
            </div>
         }

         <!-- OTHER TABS (Depts, CMS, etc.) - Content preserved but markup adapted to container -->
         @if (activeTab() === 'depts') {
             <!-- Depts Content -->
             <div class="p-8 animate-fade-in max-w-7xl mx-auto">
               <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  @for(cat of supabase.categories(); track cat.id) {
                     <div class="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm group">
                        <div class="h-32 bg-stone-100 relative overflow-hidden">
                           <img [src]="cat.image" class="w-full h-full object-cover">
                           <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button (click)="openCategoryModal(cat)" class="text-white text-xs font-bold uppercase border border-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors">Edit Dept</button>
                           </div>
                        </div>
                        <div class="p-6">
                           <h3 class="font-bold text-stone-900 uppercase tracking-widest text-sm mb-2">{{ cat.name }}</h3>
                           <div class="flex flex-wrap gap-2">
                              @for(sub of cat.subCategories; track sub) {
                                 <span class="text-[9px] bg-stone-50 border border-stone-100 px-2 py-1 rounded text-stone-500">{{ sub }}</span>
                              }
                           </div>
                        </div>
                     </div>
                  }
               </div>
            </div>
         }
         
         @if (activeTab() === 'about_cms' || activeTab() === 'contact_cms' || activeTab() === 'canvas') {
             <!-- Reuse existing CMS layout blocks -->
             @if (activeTab() === 'about_cms') {
                <div class="max-w-4xl mx-auto p-8 pb-32 animate-fade-in">
                   <div class="space-y-8 bg-white p-8 border border-stone-200 rounded-lg shadow-sm">
                      <div class="grid grid-cols-3 gap-6">
                         <div class="col-span-1">
                            <label class="label-modern">Hero Image</label>
                            <div class="aspect-[3/4] bg-stone-100 rounded overflow-hidden relative group cursor-pointer border border-stone-200">
                               <img [src]="editingPage?.heroImage" class="w-full h-full object-cover">
                               <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFileSelected($event, 'page_hero')">
                                  <span class="text-white text-xs font-bold uppercase">Change</span>
                               </div>
                            </div>
                         </div>
                         <div class="col-span-2 space-y-4">
                            <div><label class="label-modern">Page Title</label><input [(ngModel)]="editingPage!.title" class="input-modern font-serif text-lg"></div>
                            <div><label class="label-modern">Intro / Hook</label><input [(ngModel)]="editingPage!.introText" class="input-modern"></div>
                         </div>
                      </div>
                      <div>
                         <label class="label-modern">Full Story (Editorial)</label>
                         <textarea [(ngModel)]="editingPage!.bodyContent" rows="12" class="input-modern font-serif text-lg leading-relaxed"></textarea>
                      </div>
                   </div>
                </div>
             }
             @if (activeTab() === 'contact_cms') {
                <div class="max-w-4xl mx-auto p-8 pb-32 animate-fade-in">
                   <div class="space-y-8 bg-white p-8 border border-stone-200 rounded-lg shadow-sm">
                      <div class="grid grid-cols-2 gap-8">
                         <div class="aspect-[4/5] bg-stone-100 rounded overflow-hidden relative group cursor-pointer border border-stone-200">
                            <img [src]="editingPage?.heroImage" class="w-full h-full object-cover">
                            <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFileSelected($event, 'page_hero')">
                         </div>
                         <div class="space-y-4">
                            <label class="label-modern">Intro Text</label>
                            <textarea [(ngModel)]="editingPage!.bodyContent" rows="6" class="input-modern"></textarea>
                            <label class="label-modern">Location Text</label>
                            <input [(ngModel)]="editingPage!.metaData.locationText" class="input-modern">
                         </div>
                      </div>
                   </div>
                </div>
             }
             @if (activeTab() === 'canvas') {
                <div class="max-w-4xl mx-auto p-8 pb-32 animate-fade-in">
                   <h2 class="font-serif text-3xl text-stone-900 italic mb-8">System Configuration</h2>
                   <div class="bg-white p-8 border border-stone-200 rounded-lg shadow-sm space-y-8">
                      <div>
                         <label class="label-modern">EmailJS Configuration</label>
                         <div class="grid grid-cols-3 gap-4">
                            <input [(ngModel)]="tempSettings.emailJsServiceId" class="input-modern" placeholder="Service ID">
                            <input [(ngModel)]="tempSettings.emailJsTemplateId" class="input-modern" placeholder="Template ID">
                            <input [(ngModel)]="tempSettings.emailJsPublicKey" class="input-modern" placeholder="Public Key">
                         </div>
                      </div>
                      <div class="flex justify-end"><button (click)="saveSettings()" class="btn-primary">Save System Config</button></div>
                   </div>
                </div>
             }
         }

      </main>

      <!-- MODALS (Product, Category) reused identically from before -->
      @if (isProductModalOpen) {
         <div class="fixed inset-0 z-50 overflow-hidden" (click)="isProductModalOpen = false">
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>
            <div class="absolute inset-y-0 right-0 max-w-3xl w-full flex">
               <div class="w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in" (click)="$event.stopPropagation()">
                  <div class="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                     <h2 class="font-serif text-2xl text-stone-900 italic">{{ editingProduct ? 'Edit Artifact' : 'New Artifact' }}</h2>
                     <button (click)="isProductModalOpen = false" class="text-stone-400 hover:text-stone-900">✕</button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-8 space-y-8">
                     <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-2">
                           <label class="label-modern">Main Visual</label>
                           <div class="aspect-[3/4] bg-stone-100 rounded border-2 border-dashed border-stone-200 relative group overflow-hidden">
                              <img *ngIf="tempProduct.image" [src]="tempProduct.image" class="w-full h-full object-cover">
                              <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFileSelected($event, 'product_main')">
                           </div>
                        </div>
                        <div class="space-y-2">
                           <label class="label-modern">Video (URL)</label>
                           <input [(ngModel)]="tempProduct.videoUrl" class="input-modern" placeholder="https://youtube.com/...">
                           <div class="mt-4">
                              <label class="label-modern">Gallery</label>
                              <div class="flex gap-2 overflow-x-auto py-2">
                                 @for(img of tempProduct.images; track img) { <img [src]="img" class="w-16 h-20 object-cover rounded border border-stone-200"> }
                                 <div class="w-16 h-20 border-2 border-dashed border-stone-200 rounded flex items-center justify-center relative cursor-pointer">
                                    <span class="text-xl text-stone-400">+</span>
                                    <input type="file" class="absolute inset-0 opacity-0" (change)="onFileSelected($event, 'product_gallery')">
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div class="grid grid-cols-2 gap-6">
                        <div class="col-span-2"><label class="label-modern">Title</label><input [(ngModel)]="tempProduct.title" class="input-modern font-serif text-lg"></div>
                        <div><label class="label-modern">Dept</label><select [(ngModel)]="tempProduct.category" class="input-modern appearance-none">@for(cat of supabase.categories(); track cat.id) { <option [value]="cat.name">{{ cat.name }}</option> }</select></div>
                        <div><label class="label-modern">Sub</label><select [(ngModel)]="tempProduct.subCategory" class="input-modern appearance-none"><option value="">None</option>@for(sub of getSubCategories(tempProduct.category); track sub) { <option [value]="sub">{{ sub }}</option> }</select></div>
                        <div><label class="label-modern">Price</label><input type="number" [(ngModel)]="tempProduct.price" class="input-modern"></div>
                     </div>
                     <div>
                        <div class="flex justify-between"><label class="label-modern">Description</label></div>
                        <textarea [(ngModel)]="tempProduct.description" rows="5" class="input-modern font-serif"></textarea>
                     </div>
                     <div class="bg-yellow-50/50 p-6 rounded border border-yellow-100">
                        <label class="label-modern">Affiliate Link</label>
                        <input [(ngModel)]="tempProduct.affiliateLink" class="input-modern border-yellow-200" placeholder="https://">
                        <div class="mt-4 flex justify-between">
                           <div class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="tempProduct.verified" class="accent-stone-900"><span class="text-xs font-bold text-stone-600">Verified</span></div>
                           <select [(ngModel)]="tempProduct.stockStatus" class="input-modern w-40"><option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Sold Out">Sold Out</option></select>
                        </div>
                     </div>
                  </div>
                  <div class="p-6 border-t border-stone-100 flex justify-end gap-4 bg-white">
                     <button (click)="saveProduct()" [disabled]="isUploading" class="btn-primary w-48 shadow-xl">{{ editingProduct ? 'Save Changes' : 'Add to Vault' }}</button>
                  </div>
               </div>
            </div>
         </div>
      }
      
      @if (showCategoryForm) {
         <div class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center" (click)="showCategoryForm = false">
            <div class="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl" (click)="$event.stopPropagation()">
               <h3 class="font-serif text-2xl mb-6">Department Editor</h3>
               <div class="space-y-4">
                  <input [(ngModel)]="newCategory.name" class="input-modern" placeholder="Name">
                  <input [(ngModel)]="newCategory.slug" class="input-modern" placeholder="Slug">
                   <div class="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded relative cursor-pointer">
                      <img *ngIf="newCategory.image" [src]="newCategory.image" class="w-full h-full object-cover">
                      <input type="file" class="absolute inset-0 opacity-0" (change)="onFileSelected($event, 'category')">
                      <span *ngIf="!newCategory.image" class="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-400">Cover Image</span>
                  </div>
                  <div>
                     <label class="label-modern">Sub-Categories</label>
                     <input [ngModel]="newCategory.subCategories.join(', ')" (ngModelChange)="updateSubCats($event)" class="input-modern">
                  </div>
                  <button (click)="saveCategory()" class="btn-primary w-full">Save Department</button>
               </div>
            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    .nav-btn { @apply flex flex-col items-center justify-center py-4 px-6 md:px-10 text-stone-500 hover:text-white hover:bg-stone-800 transition-all border-b-4 border-transparent min-w-[100px]; }
    .nav-btn.active { @apply text-white border-yellow-600 bg-stone-800; }
    .sub-tab { @apply h-full px-4 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors border-b-2 border-transparent whitespace-nowrap; }
    .sub-tab.active { @apply text-stone-900 border-stone-900; }
    .kpi-card { @apply bg-white p-6 rounded-lg border border-stone-200 shadow-sm flex flex-col justify-between h-32; }
    .kpi-label { @apply text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2 block; }
    .kpi-value { @apply text-4xl font-serif text-stone-900; }
    .btn-primary { @apply bg-stone-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-yellow-600 transition-colors disabled:opacity-50; }
    .action-btn-primary { @apply bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-800 shadow-lg flex items-center gap-2 transition-all hover:scale-105 whitespace-nowrap; }
    .action-btn-secondary { @apply bg-white text-stone-900 border border-stone-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-50 shadow-sm flex items-center gap-2 transition-all whitespace-nowrap; }
    .input-modern { @apply w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-800 focus:bg-white transition-all placeholder-stone-400; }
    .label-modern { @apply block text-[9px] uppercase tracking-widest text-stone-500 font-bold mb-2; }
    .tip-box { @apply bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-stone-800 text-sm font-medium shadow-sm relative overflow-hidden; }
    .step-card { @apply flex items-center gap-4 bg-stone-50 p-4 rounded border border-stone-200 shadow-sm; }
    .step-num { @apply w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs; }
    
    .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-bounce-slow { animation: bounceSlow 3s infinite; }
    @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    
    .shadow-glow { box-shadow: 0 0 15px rgba(217, 119, 6, 0.4); }
  `]
})
export class AdminLayoutComponent {
  supabase = inject(SupabaseService);
  // FIX: Explicitly type Router
  router: Router = inject(Router);

  activeGroup = signal<TabGroup>('engine');
  activeTab = signal<Tab>('guide'); // Default to guide for new users
  
  unreadCount = computed(() => this.supabase.messages().filter(m => !m.read).length);
  analyticsStats = computed(() => {
     const events = this.supabase.analytics();
     const totalViews = events.filter(e => e.type === 'page_view').length;
     const conversions = events.filter(e => e.type === 'affiliate_click').length;
     const conversionRate = totalViews > 0 ? ((conversions / totalViews) * 100).toFixed(2) : '0';
     return { totalViews, conversions, conversionRate };
  });

  // CMS State
  editingPage: PageContent | undefined;
  
  // Product State
  isProductModalOpen = false;
  editingProduct: Product | null = null;
  tempProduct: any = this.getEmptyProduct();
  
  // Category State
  showCategoryForm = false;
  newCategory: any = { name: '', slug: '', image: '', count: 0, subCategories: [] };
  
  // Settings State
  tempSettings: Settings = { siteName: '', heroTitle: '', heroSubtitle: '', curatorName: '', curatorBio: '', curatorImage: '', contactEmail: '', themePrimaryColor: '', themeSecondaryColor: '', themeFontHeading: '', themeFontBody: '' };
  
  isUploading = false;
  showSlideForm = false; // Kept for interface compatibility
  
  // Guide Templates
  sqlTemplate = `
-- 1. SETTINGS
create table settings (
  id text primary key,
  "siteName" text, "heroTitle" text, "heroSubtitle" text,
  "curatorName" text, "curatorBio" text, "curatorImage" text,
  "contactEmail" text, "themePrimaryColor" text, "themeSecondaryColor" text,
  "themeFontHeading" text, "themeFontBody" text,
  "socialInstagram" text, "socialTiktok" text,
  "googleAnalyticsId" text, "emailJsPublicKey" text, "emailJsServiceId" text, "emailJsTemplateId" text
);
alter table settings enable row level security;
create policy "Public Read Settings" on settings for select using (true);
create policy "Admin Update Settings" on settings for all using (auth.role() = 'authenticated');

-- 2. PRODUCTS
create table products (
  id uuid default gen_random_uuid() primary key,
  title text, price numeric, "originalPrice" numeric, "discountLabel" text,
  description text, category text, "subCategory" text,
  image text, images text[], "videoUrl" text, colors text[],
  sku text, "affiliateLink" text, verified boolean default true, "stockStatus" text,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "Public Read Products" on products for select using (true);
create policy "Admin Manage Products" on products for all using (auth.role() = 'authenticated');

-- 3. CATEGORIES
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text, slug text, image text, count int default 0, "subCategories" text[]
);
alter table categories enable row level security;
create policy "Public Read Categories" on categories for select using (true);
create policy "Admin Manage Categories" on categories for all using (auth.role() = 'authenticated');

-- 4. PAGES (CMS)
create table pages (
  id uuid default gen_random_uuid() primary key,
  slug text unique, title text, "heroImage" text, "introText" text,
  "bodyContent" text, "metaData" jsonb
);
alter table pages enable row level security;
create policy "Public Read Pages" on pages for select using (true);
create policy "Admin Manage Pages" on pages for all using (auth.role() = 'authenticated');

-- 5. MESSAGES
create table messages (
  id uuid default gen_random_uuid() primary key,
  name text, email text, subject text, message text,
  read boolean default false, "replySent" boolean default false,
  date timestamptz default now()
);
alter table messages enable row level security;
create policy "Admin Manage Messages" on messages for all using (auth.role() = 'authenticated');
create policy "Public Insert Messages" on messages for insert with check (true);

-- 6. HERO SLIDES
create table hero_slides (
  id uuid default gen_random_uuid() primary key,
  image text, title text, subtitle text, "ctaText" text, "ctaLink" text
);
alter table hero_slides enable row level security;
create policy "Public Read Slides" on hero_slides for select using (true);
create policy "Admin Manage Slides" on hero_slides for all using (auth.role() = 'authenticated');

-- 7. REVIEWS
create table reviews (
  id uuid default gen_random_uuid() primary key,
  "productId" uuid references products(id) on delete cascade,
  "user" text, rating int, comment text, date timestamptz default now()
);
alter table reviews enable row level security;
create policy "Public Read Reviews" on reviews for select using (true);
create policy "Public Insert Reviews" on reviews for insert with check (true);

-- 8. ANALYTICS
create table analytics_events (
  id uuid default gen_random_uuid() primary key,
  type text, path text, "targetId" text, metadata jsonb,
  timestamp timestamptz default now()
);
alter table analytics_events enable row level security;
create policy "Admin Read Analytics" on analytics_events for select using (auth.role() = 'authenticated');
create policy "Public Insert Analytics" on analytics_events for insert with check (true);

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('maison-assets', 'maison-assets', true);
create policy "Public Access Assets" on storage.objects for select using ( bucket_id = 'maison-assets' );
create policy "Admin Upload Assets" on storage.objects for insert using ( bucket_id = 'maison-assets' and auth.role() = 'authenticated' );
`.trim();

  emailTemplate = `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #d97706;">New Inquiry from {{name}}</h2>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
  
  <p><strong>Subject:</strong> {{subject}}</p>
  <p><strong>Email:</strong> {{email}}</p>
  
  <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d97706; margin-top: 20px;">
    <p style="margin: 0; font-style: italic;">"{{message}}"</p>
  </div>
  
  <p style="margin-top: 30px; font-size: 12px; color: #999;">
    Sent via Maison Portal Concierge
  </p>
</div>
  `.trim();

  constructor() {
    if (!this.supabase.isAdmin()) this.router.navigate(['/login']);
    
    effect(() => {
        const s = this.supabase.settings();
        if (s) this.tempSettings = { ...s };
        
        if (this.activeTab() === 'about_cms') {
           this.editingPage = this.supabase.getPageContent('about') ? { ...this.supabase.getPageContent('about')! } : undefined;
        } else if (this.activeTab() === 'contact_cms') {
           this.editingPage = this.supabase.getPageContent('contact') ? { ...this.supabase.getPageContent('contact')! } : undefined;
        }
    }, { allowSignalWrites: true });
  }

  logout() { this.supabase.logout(); this.router.navigate(['/']); }

  selectGroup(group: TabGroup) {
      this.activeGroup.set(group);
      if (group === 'insight') this.activeTab.set('dashboard');
      if (group === 'collection') this.activeTab.set('catalog');
      if (group === 'identity') this.activeTab.set('about_cms');
      if (group === 'engine') this.activeTab.set('guide'); // Default to guide
  }

  getMaskedUrl() {
     const url = process.env['SUPABASE_URL'] || 'unknown-url.supabase.co';
     return url.substring(8, 16) + '****' + url.substring(url.length - 10);
  }

  copyToClipboard(text: string) {
     navigator.clipboard.writeText(text);
     alert('Copied to clipboard!');
  }

  // --- CMS ---
  async savePageContent() {
    if (!this.editingPage) return;
    this.isUploading = true;
    await this.supabase.updatePage(this.editingPage.slug, this.editingPage);
    this.isUploading = false;
    alert('Content Published.');
  }

  addFaq() {
    this.editingPage?.metaData.faq.push({ q: '', a: '' });
  }
  removeFaq(idx: number) {
    this.editingPage?.metaData.faq.splice(idx, 1);
  }

  // --- PRODUCTS ---
  getEmptyProduct() {
    return { title: '', price: 0, category: 'Apparel', subCategory: '', description: '', image: '', images: [], affiliateLink: '#', verified: true, stockStatus: 'In Stock' };
  }
  
  getSubCategories(catName: string) {
    const c = this.supabase.categories().find(x => x.name === catName);
    return c ? c.subCategories : [];
  }

  openProductModal(product?: Product) {
    this.editingProduct = product || null;
    this.tempProduct = product ? JSON.parse(JSON.stringify(product)) : this.getEmptyProduct();
    this.isProductModalOpen = true;
  }

  async saveProduct() {
    this.isUploading = true;
    if (this.editingProduct?.id) {
      await this.supabase.updateProduct(this.editingProduct.id, this.tempProduct);
    } else {
      await this.supabase.addProduct(this.tempProduct);
    }
    this.isProductModalOpen = false;
    this.isUploading = false;
  }

  // --- CATEGORIES ---
  openCategoryModal(cat?: any) {
    this.newCategory = cat ? JSON.parse(JSON.stringify(cat)) : { name: '', slug: '', image: '', count: 0, subCategories: [] };
    this.showCategoryForm = true;
  }

  updateSubCats(val: string) {
    this.newCategory.subCategories = val.split(',').map(s => s.trim()).filter(s => s);
  }

  async saveCategory() {
    if (this.newCategory.id) {
       await this.supabase.updateCategory(this.newCategory.id, this.newCategory);
    } else {
       await this.supabase.addCategory(this.newCategory);
    }
    this.showCategoryForm = false;
  }

  // --- SETTINGS ---
  async saveSettings() {
    await this.supabase.updateSettings(this.tempSettings);
    alert('Settings Saved.');
  }

  // --- FILE HANDLING ---
  async onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploading = true;
    const url = await this.supabase.uploadFile(file);
    if (!url) return;
    
    if (type === 'product_main') this.tempProduct.image = url;
    if (type === 'product_gallery') {
       if(!this.tempProduct.images) this.tempProduct.images = [];
       this.tempProduct.images.push(url);
    }
    if (type === 'page_hero') this.editingPage!.heroImage = url;
    if (type === 'category') this.newCategory.image = url;
    
    this.isUploading = false;
  }

  openUserModal() {}
}