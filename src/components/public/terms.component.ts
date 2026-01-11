import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-40 pb-20 bg-[#faf9f6] min-h-screen">
      <div class="max-w-4xl mx-auto px-6">
        <h1 class="text-5xl md:text-6xl font-serif text-stone-900 mb-12">Legal & Disclosures</h1>
        
        <div class="prose prose-stone max-w-none text-stone-700 font-light">
          
          <!-- TERMS SECTION -->
          <section id="terms" class="mb-24 scroll-mt-32">
            <h2 class="text-3xl font-serif text-stone-900 italic mb-6 border-b border-stone-200 pb-4">Terms of Service</h2>
            <p class="mb-4">
              Welcome to {{ supabase.settings()?.siteName }} ("we," "us," or "our"). By accessing or using our website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our website.
            </p>
            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">1. Use of the Site</h3>
            <p class="mb-4">
              This website is intended for individuals who are at least 18 years old. You are granted a limited, revocable, and non-exclusive right to create a hyperlink to the home page of {{ supabase.settings()?.siteName }}, provided the link does not portray us in a false, misleading, derogatory, or otherwise offensive matter.
            </p>
            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">2. Intellectual Property</h3>
            <p class="mb-4">
              All content included on this site, such as text, graphics, logos, images, and software, is the property of {{ supabase.settings()?.siteName }} or its content suppliers and protected by international copyright laws. The compilation of all content on this site is the exclusive property of {{ supabase.settings()?.siteName }}.
            </p>
            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">3. Product Descriptions</h3>
            <p class="mb-4">
              We attempt to be as accurate as possible. However, {{ supabase.settings()?.siteName }} does not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free. If a product offered by a third-party retailer via our site is not as described, your sole remedy is to return it to that retailer in unused condition.
            </p>
          </section>

          <!-- AFFILIATE DISCLOSURE SECTION -->
          <section id="affiliate" class="mb-24 scroll-mt-32">
            <h2 class="text-3xl font-serif text-stone-900 italic mb-6 border-b border-stone-200 pb-4">Affiliate Disclosure</h2>
            <div class="bg-yellow-50 border border-yellow-100 p-8 rounded-sm mb-8">
               <p class="font-medium text-stone-900 leading-relaxed text-lg italic">
                 "Transparency is our core value. Trust is our currency."
               </p>
            </div>
            <p class="mb-6">
              {{ supabase.settings()?.siteName }} participates in various affiliate marketing programs, which means we may get paid commissions on editorially chosen products purchased through our links to retailer sites.
            </p>
            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">How it Works</h3>
            <p class="mb-4">
              When you click on a link to a product on our site, you are taken to the third-party retailer's website (e.g., MatchesFashion, Net-a-Porter, Farfetch). If you make a purchase, the retailer pays us a small percentage of the sale. 
            </p>
            <p class="mb-4">
              <strong>This comes at no extra cost to you.</strong> The price you pay is the same whether you use our link or go directly to the vendor's site.
            </p>
            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">Our Vetting Process</h3>
            <p class="mb-4">
              Our editorial content is not influenced by affiliate partnerships. We only feature items that meet our strict standards for quality, design, and longevity. If we wouldn't own it, we don't list it.
            </p>
          </section>

          <!-- PRIVACY SECTION -->
          <section id="privacy" class="mb-24 scroll-mt-32">
            <h2 class="text-3xl font-serif text-stone-900 italic mb-6 border-b border-stone-200 pb-4">Privacy Policy</h2>
            <p class="mb-4">
              Your privacy is critically important to us. At {{ supabase.settings()?.siteName }}, we have a few fundamental principles:
            </p>
            <ul class="list-disc pl-5 mb-6 space-y-2">
               <li>We don't ask you for personal information unless we truly need it (e.g., for newsletter subscriptions or inquiries).</li>
               <li>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
               <li>We don't store personal information on our servers unless required for the on-going operation of one of our services.</li>
            </ul>

            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">Website Visitors</h3>
            <p class="mb-4">
              Like most website operators, {{ supabase.settings()?.siteName }} collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request.
            </p>

            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">Cookies</h3>
            <p class="mb-4">
              A cookie is a string of information that a website stores on a visitor's computer, and that the visitor's browser provides to the website each time the visitor returns. {{ supabase.settings()?.siteName }} uses cookies to help us identify and track visitors, their usage of our website, and their website access preferences.
            </p>

            <h3 class="text-lg font-bold uppercase tracking-widest text-stone-800 mb-3 mt-8">Contact</h3>
            <p class="mb-4">
              If you have any questions about this Privacy Policy, please contact us via our <a routerLink="/contact" class="text-yellow-600 hover:underline">Contact Page</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  `
})
export class TermsComponent implements OnInit, AfterViewInit {
  supabase = inject(SupabaseService);
  // FIX: Explicitly type ActivatedRoute
  route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    // Basic init logic if needed
  }

  ngAfterViewInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          // Small timeout to ensure DOM render
          setTimeout(() => {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      } else {
        window.scrollTo(0, 0);
      }
    });
  }
}