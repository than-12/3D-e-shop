import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import CategoryNav from "@/components/category-nav";
import ProductCard from "@/components/product-card";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/use-language";
import { SEO } from "@/components/ui/seo";
import productImage from './images/product.jpg';
import CustomImage from './images/custom.jpg';
import LithoImage from './images/lithophane.jpg';


const Home = () => {
  const { t } = useLanguage();
  const { data: featuredProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true }],
  });
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselSlides = [
    {
      id: 1,
      image: productImage,
      description: t('home.hero_desc_1'),
      buttonText: t('home.hero_button_1'),
      buttonLink: "/products"
    },
    {
      id: 2,
      image: CustomImage,
      title: t('home.hero_title_2'),
      description: t('home.hero_desc_2'),
      buttonText: t('home.hero_button_2'),
      buttonLink: "/calculator"
    },
    {
      id: 3,
      image: LithoImage,
      title: t('home.hero_title_3'),
      description: t('home.hero_desc_3'),
      buttonText: t('home.hero_button_3'),
      buttonLink: "/lithophane"
    }
  ];
  
  // Handle slide navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
  }, [carouselSlides.length]);
  
  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, [carouselSlides.length]);
  
  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      <SEO 
        title={t("home.seo.title", "Αρχική Σελίδα")} 
        description={t("home.seo.description", "Επαγγελματικές υπηρεσίες 3D εκτύπωσης για προσαρμοσμένα μοντέλα, φιγούρες και περισσότερα.")} 
      />
      
      <div>
        {/* Hero Section with Carousel */}
        <div className="relative bg-gray-900 h-[600px]">
          {/* Slides */}
          <div className="absolute inset-0 overflow-hidden">
            {carouselSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              </div>
            ))}
          </div>
          
          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl w-full mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8">
              {carouselSlides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 absolute'}`}
                  style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
                >
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">{slide.title}</h1>
                  <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                    {slide.description}
                  </p>
                  <div className="mt-10">
                    <Button asChild size="lg" className={`font-medium ${index === 1 ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''} ${index === 2 ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>
                      <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button 
              onClick={prevSlide}
              className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-r-lg focus:outline-none ml-4"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button 
              onClick={nextSlide}
              className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-l-lg focus:outline-none mr-4"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Indicators */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
            {carouselSlides.map((_, index) => (
              <button 
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
              />
            ))}
          </div>
        </div>

        {/* Category Navigation */}
        <CategoryNav />

        {/* Featured Products */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('home.featured_products')}</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Check out our most popular 3D printed items, ready to ship within 48 hours.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('common.loading')}</p>
                </div>
              ) : Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('home.no_featured_products')}</p>
                </div>
              )}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="font-medium">
                <Link href="/products">
                  {t('home.view_all_products')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('home.how_it_works')}</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
                From your 3D model to finished product in four simple steps.
              </p>
            </div>

            <div className="mt-12">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-lg font-medium text-gray-900">
                    Our Process
                  </span>
                </div>
              </div>

              <div className="mt-8 max-w-lg mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:max-w-none">
                {[
                  {
                    step: 1,
                    title: t('home.step_1_title'),
                    description: t('home.step_1_desc')
                  },
                  {
                    step: 2,
                    title: t('home.step_2_title'),
                    description: t('home.step_2_desc')
                  },
                  {
                    step: 3,
                    title: "We Print & Finish",
                    description: "Our expert team prints your model with precision and applies any finishing touches needed."
                  },
                  {
                    step: 4,
                    title: t('home.step_3_title'),
                    description: t('home.step_3_desc')
                  }
                ].map((item) => (
                  <div key={item.step} className="relative">
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white text-2xl font-bold mb-4 mx-auto">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 text-center">{item.title}</h3>
                    <p className="mt-2 text-base text-gray-500 text-center">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">{t('home.call_to_action')}</h2>
              <p className="mt-3 max-w-md mx-auto text-xl text-blue-100">
                Join our newsletter for exclusive deals and 3D printing tips.
              </p>
            </div>
            <div className="mt-8 max-w-md mx-auto">
              <form className="sm:flex">
                <label htmlFor="email-address" className="sr-only">{t('common.email')}</label>
                <input 
                  id="email-address" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="w-full px-5 py-3 placeholder-gray-500 focus:ring-white focus:border-white sm:max-w-xs border-white rounded-md" 
                  placeholder={t('footer.newsletter_placeholder')} 
                />
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <Button type="submit" className="w-full px-5 py-3 bg-white text-primary hover:bg-blue-50 font-medium">
                    {t('footer.newsletter_button')}
                  </Button>
                </div>
              </form>
              <p className="mt-3 text-sm text-blue-100">
                We care about your data. Read our <a href="#" className="font-medium underline">{t('footer.privacy')}</a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
