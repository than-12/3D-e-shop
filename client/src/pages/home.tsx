import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import CategoryNav from "@/components/category-nav";
import ProductCard from "@/components/product-card";
import { useState, useEffect, useCallback } from "react";

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true }],
  });
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1581093450021-a7a5e9e1f993?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=600&q=80",
      title: "High-Quality 3D Printed Products",
      description: "Transform your ideas into reality with our catalog of professionally designed 3D printed products.",
      buttonText: "Shop Products",
      buttonLink: "/products"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=600&q=80",
      title: "Instant Cost Estimation",
      description: "Get accurate pricing for your 3D printing projects with our advanced cost calculator.",
      buttonText: "Get Cost Estimate",
      buttonLink: "/calculator"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=600&q=80",
      title: "Custom Lithophane Printing",
      description: "Turn your favorite photos into stunning lithophanes that come to life when illuminated.",
      buttonText: "Create Lithophane",
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
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Featured Products</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Check out our most popular 3D printed items, ready to ship within 48 hours.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              // Loading skeletons
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                  <div className="bg-gray-300 h-64 w-full rounded-md"></div>
                  <div className="mt-4 bg-gray-300 h-6 w-3/4 rounded"></div>
                  <div className="mt-2 bg-gray-300 h-4 w-full rounded"></div>
                  <div className="mt-4 flex justify-between">
                    <div className="bg-gray-300 h-6 w-16 rounded"></div>
                    <div className="bg-gray-300 h-6 w-20 rounded"></div>
                  </div>
                  <div className="mt-4 bg-gray-300 h-10 w-full rounded"></div>
                </div>
              ))
            ) : (
              featuredProducts?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="/products">
                View All Products
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
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
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
                  title: "Upload Your Model",
                  description: "Upload your STL file and select your preferred material and quality settings."
                },
                {
                  step: 2,
                  title: "Receive Quote",
                  description: "Get an instant price estimate based on size, complexity, and material requirements."
                },
                {
                  step: 3,
                  title: "We Print & Finish",
                  description: "Our expert team prints your model with precision and applies any finishing touches needed."
                },
                {
                  step: 4,
                  title: "Fast Delivery",
                  description: "Your finished 3D printed product is carefully packaged and shipped directly to you."
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

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Don't just take our word for it — hear from some of our satisfied customers.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                quote: "I needed custom parts for my drone project and 3D PrintCraft delivered exactly what I needed. The quality was excellent, and the turnaround time was faster than expected.",
                name: "Alex Johnson",
                title: "Drone Enthusiast",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              },
              {
                quote: "The cost estimator tool was incredibly accurate. What impressed me most was how they handled a particularly complex architectural model with perfect detail.",
                name: "Sarah Reynolds",
                title: "Architect",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              },
              {
                quote: "I've ordered multiple figurines for my tabletop gaming group. The quality is consistently high, and the prices are reasonable compared to other services I've tried.",
                name: "Marcus Chen",
                title: "Game Master",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-500">★</span>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center mt-6">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Stay updated with our latest designs</h2>
            <p className="mt-3 max-w-md mx-auto text-xl text-blue-100">
              Join our newsletter for exclusive deals and 3D printing tips.
            </p>
          </div>
          <div className="mt-8 max-w-md mx-auto">
            <form className="sm:flex">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="w-full px-5 py-3 placeholder-gray-500 focus:ring-white focus:border-white sm:max-w-xs border-white rounded-md" 
                placeholder="Enter your email" 
              />
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button type="submit" className="w-full px-5 py-3 bg-white text-primary hover:bg-blue-50 font-medium">
                  Subscribe
                </Button>
              </div>
            </form>
            <p className="mt-3 text-sm text-blue-100">
              We care about your data. Read our <a href="#" className="font-medium underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
