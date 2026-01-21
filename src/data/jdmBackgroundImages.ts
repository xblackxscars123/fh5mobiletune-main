import { BackgroundImage } from '@/hooks/useBackgroundSlideshow';

// Import local JDM images
import supra from '@/assets/jdm/supra.jpg';
import gtr from '@/assets/jdm/gtr.jpg';
import rx7 from '@/assets/jdm/rx7.jpg';
import nsx from '@/assets/jdm/nsx.jpg';
import silvia from '@/assets/jdm/silvia.jpg';
import evo from '@/assets/jdm/evo.jpg';
import wrx from '@/assets/jdm/wrx.jpg';
import z350 from '@/assets/jdm/350z.jpg';
import ae86 from '@/assets/jdm/ae86.jpg';
import s2000 from '@/assets/jdm/s2000.jpg';
import r32 from '@/assets/jdm/r32.jpg';
import mr2 from '@/assets/jdm/mr2.jpg';

export interface ExtendedBackgroundImage extends BackgroundImage {
  isRemote?: boolean;
  photographer?: string;
  carName?: string;
}

// Curated JDM car images - mix of local and Unsplash
export const jdmBackgroundImages: ExtendedBackgroundImage[] = [
  // Local images (fallbacks, always reliable)
  { src: supra, alt: 'Toyota Supra MK4', focusX: -0.3, focusY: 0.2, carName: 'Toyota Supra MK4' },
  { src: gtr, alt: 'Nissan GT-R R35', focusX: 0.4, focusY: -0.1, carName: 'Nissan GT-R R35' },
  { src: rx7, alt: 'Mazda RX-7 FD', focusX: 0.2, focusY: 0.3, carName: 'Mazda RX-7 FD' },
  { src: nsx, alt: 'Honda NSX', focusX: -0.4, focusY: 0.1, carName: 'Honda NSX' },
  { src: silvia, alt: 'Nissan Silvia S15', focusX: 0.3, focusY: -0.2, carName: 'Nissan Silvia S15' },
  { src: evo, alt: 'Mitsubishi Evolution', focusX: -0.2, focusY: -0.3, carName: 'Mitsubishi Lancer Evolution' },
  { src: wrx, alt: 'Subaru WRX STI', focusX: 0.1, focusY: 0.4, carName: 'Subaru WRX STI' },
  { src: z350, alt: 'Nissan 350Z', focusX: -0.3, focusY: -0.1, carName: 'Nissan 350Z' },
  { src: ae86, alt: 'Toyota AE86 Trueno', focusX: 0.4, focusY: 0.2, carName: 'Toyota AE86 Trueno' },
  { src: s2000, alt: 'Honda S2000', focusX: -0.1, focusY: 0.3, carName: 'Honda S2000' },
  { src: r32, alt: 'Nissan Skyline R32', focusX: 0.2, focusY: -0.3, carName: 'Nissan Skyline R32 GT-R' },
  { src: mr2, alt: 'Toyota MR2', focusX: -0.4, focusY: 0.1, carName: 'Toyota MR2' },
  
  // Unsplash JDM car images (curated, high-quality)
  { 
    src: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80&auto=format', 
    alt: 'JDM Sports Car', focusX: 0.3, focusY: 0.1, isRemote: true, 
    photographer: 'Campbell', carName: 'JDM Sports Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1920&q=80&auto=format', 
    alt: 'Japanese Performance Car', focusX: -0.2, focusY: 0.2, isRemote: true,
    photographer: 'Dhiva Krishna', carName: 'Japanese Performance Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1920&q=80&auto=format', 
    alt: 'Nissan GTR Night', focusX: 0.1, focusY: -0.2, isRemote: true,
    photographer: 'Erik Mclean', carName: 'Nissan GT-R'
  },
  { 
    src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80&auto=format', 
    alt: 'Mazda RX-7 Side Profile', focusX: -0.3, focusY: 0.15, isRemote: true,
    photographer: 'KOBU Agency', carName: 'Mazda RX-7'
  },
  { 
    src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80&auto=format', 
    alt: 'Sports Car Sunset', focusX: 0.25, focusY: -0.1, isRemote: true,
    photographer: 'Tyler Clemmensen', carName: 'Sports Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1920&q=80&auto=format', 
    alt: 'Tokyo Night Racing', focusX: -0.15, focusY: 0.3, isRemote: true,
    photographer: 'Denys Nevozhai', carName: 'Tokyo Street Scene'
  },
  { 
    src: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1920&q=80&auto=format', 
    alt: 'Modified Nissan', focusX: 0.35, focusY: 0.05, isRemote: true,
    photographer: 'Joey Banks', carName: 'Modified Nissan'
  },
  { 
    src: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1920&q=80&auto=format', 
    alt: 'JDM Legend', focusX: -0.25, focusY: -0.15, isRemote: true,
    photographer: 'Martin Katler', carName: 'JDM Legend'
  },
  { 
    src: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1920&q=80&auto=format', 
    alt: 'Performance Coupe', focusX: 0.2, focusY: 0.25, isRemote: true,
    photographer: 'Dan Giumarello', carName: 'Performance Coupe'
  },
  { 
    src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920&q=80&auto=format', 
    alt: 'Red Sports Car', focusX: -0.1, focusY: 0.1, isRemote: true,
    photographer: 'Michael Fousert', carName: 'Red Sports Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80&auto=format', 
    alt: 'Classic Sports Car', focusX: 0.15, focusY: -0.25, isRemote: true,
    photographer: 'Caleb Steele', carName: 'Classic Sports Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&q=80&auto=format', 
    alt: 'Blue JDM', focusX: -0.35, focusY: 0.2, isRemote: true,
    photographer: 'Erik Mclean', carName: 'Blue JDM'
  },
  { 
    src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80&auto=format', 
    alt: 'Sunset Drive', focusX: 0.3, focusY: -0.05, isRemote: true,
    photographer: 'Michael Jin', carName: 'Sunset Drive'
  },
  { 
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80&auto=format', 
    alt: 'Sports Car Mountain', focusX: -0.2, focusY: 0.35, isRemote: true,
    photographer: 'Campbell', carName: 'Sports Car Mountain'
  },
  { 
    src: 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=1920&q=80&auto=format', 
    alt: 'Night Racing Scene', focusX: 0.1, focusY: 0.15, isRemote: true,
    photographer: 'Alexander Popov', carName: 'Night Racing'
  },
  { 
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format', 
    alt: 'Japanese Import', focusX: -0.15, focusY: -0.1, isRemote: true,
    photographer: 'Thong Vo', carName: 'Japanese Import'
  },
  { 
    src: 'https://images.unsplash.com/photo-1612825173281-9a193378d98a?w=1920&q=80&auto=format', 
    alt: 'Tuned Car', focusX: 0.25, focusY: 0.3, isRemote: true,
    photographer: 'Josh Berquist', carName: 'Tuned Car'
  },
  { 
    src: 'https://images.unsplash.com/photo-1581650107963-3e8c1f48241b?w=1920&q=80&auto=format', 
    alt: 'Garage Scene', focusX: -0.3, focusY: 0.05, isRemote: true,
    photographer: 'Mason Jones', carName: 'Garage Scene'
  },
];

// Get only local images as fallback
export const localJdmImages: ExtendedBackgroundImage[] = jdmBackgroundImages.filter(img => !img.isRemote);

// Shuffle array utility for random order
export function shuffleImages<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
