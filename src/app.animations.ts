import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const magazineFlip = trigger('routeAnimations', [
  transition('* <=> *', [
    // Container container styles to enable 3D perspective
    style({ position: 'relative', perspective: '2000px', overflow: 'hidden' }),
    
    // Set default styles for entering and leaving elements
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        'backface-visibility': 'hidden',
        'transform-style': 'preserve-3d',
        'transform-origin': 'left center'
      })
    ], { optional: true }),

    // Initial state of the ENTERING page (Hidden on the right, slightly rotated like an open page)
    query(':enter', [
      style({ 
        transform: 'translateX(100%) rotateY(-25deg)', 
        zIndex: 20,
        boxShadow: '-20px 0 50px rgba(0,0,0,0.3)' 
      })
    ], { optional: true }),

    // Initial state of the LEAVING page (Visible)
    query(':leave', [
      style({ 
        transform: 'translateX(0) rotateY(0)', 
        zIndex: 10 
      })
    ], { optional: true }),

    group([
      // Animate LEAVING page: Slight fade and scale down to simulate depth
      query(':leave', [
        animate('800ms cubic-bezier(0.25, 1, 0.5, 1)', style({ 
          transform: 'scale(0.95) translateX(-10%)',
          filter: 'brightness(0.8)' 
        }))
      ], { optional: true }),

      // Animate ENTERING page: Slide in and flatten rotation
      query(':enter', [
        animate('800ms cubic-bezier(0.25, 1, 0.5, 1)', style({ 
          transform: 'translateX(0) rotateY(0)',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)'
        }))
      ], { optional: true })
    ])
  ])
]);