
import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './components/public/public-layout.component';
import { HomeComponent } from './components/public/home.component';
import { ProductsComponent } from './components/public/products.component';
import { ProductDetailComponent } from './components/public/product-detail.component';
import { AboutComponent } from './components/public/about.component';
import { ContactComponent } from './components/public/contact.component';
import { TermsComponent } from './components/public/terms.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
      { path: 'products', component: ProductsComponent, data: { animation: 'ProductsPage' } },
      { path: 'product/:id', component: ProductDetailComponent, data: { animation: 'DetailPage' } },
      { path: 'about', component: AboutComponent, data: { animation: 'AboutPage' } },
      { path: 'contact', component: ContactComponent, data: { animation: 'ContactPage' } },
      { path: 'terms', component: TermsComponent, data: { animation: 'TermsPage' } },
    ]
  },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'admin', component: AdminLayoutComponent, data: { animation: 'AdminPage' } },
  { path: '**', redirectTo: '' }
];
