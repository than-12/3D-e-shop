import { ChevronRight, Printer, Wrench, Award, Truck, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { SEO } from "@/components/ui/seo";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <SEO 
        title={t("about.seo.title", "Σχετικά με Εμάς")} 
        description={t("about.seo.description", "Μάθετε περισσότερα για την εταιρεία μας και πώς ξεκινήσαμε να προσφέρουμε υπηρεσίες 3D εκτύπωσης υψηλής ποιότητας.")} 
      />
      
      <div>
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{t('about.about_3d_printcraft')}</h1>
                <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                  {t('about.intro_text')}
                </p>
                <div className="mt-10">
                  <Button asChild size="lg" className="font-medium">
                    <Link href="/contact">{t('about.get_in_touch')}</Link>
                  </Button>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:ml-8">
                <img 
                  src="https://images.unsplash.com/photo-1612886116292-b9cfd61dbbf3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="3D Printing Workshop" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">{t('about.our_story')}</h2>
                <div className="mt-6 text-gray-600 space-y-4">
                  <p>{t('about.foundation_text')}</p>
                  <p>{t('about.growth_text')}</p>
                  <p>{t('about.mission_text')}</p>
                </div>
                <div className="mt-8">
                  <Button variant="outline" asChild className="group">
                    <Link href="/products">
                      {t('about.explore_products')}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1566733971021-e9c0ae5943c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80" 
                    alt="3D Printing Machine" 
                    className="rounded-lg shadow"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=450&q=80" 
                    alt="Product prototyping" 
                    className="rounded-lg shadow"
                  />
                </div>
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=600&q=80" 
                    alt="3D Printed Objects" 
                    className="rounded-lg shadow h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">{t('about.our_values')}</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('about.values_description')}
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Printer className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.innovation')}</h3>
                  <p className="text-gray-600">
                    {t('about.innovation_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.quality')}</h3>
                  <p className="text-gray-600">
                    {t('about.quality_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.reliability')}</h3>
                  <p className="text-gray-600">
                    {t('about.reliability_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Wrench className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.craftsmanship')}</h3>
                  <p className="text-gray-600">
                    {t('about.craftsmanship_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.passion')}</h3>
                  <p className="text-gray-600">
                    {t('about.passion_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.community')}</h3>
                  <p className="text-gray-600">
                    {t('about.community_text')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Our Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">{t('about.our_process')}</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {t('about.process_description')}
              </p>
            </div>
            
            <div className="mt-16">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-lg font-medium text-gray-900">
                    {t('about.how_we_work')}
                  </span>
                </div>
              </div>
              
              <div className="mt-12 grid gap-12 lg:grid-cols-4">
                {[
                  {
                    step: "01",
                    title: t('about.file_preparation'),
                    description: t('about.file_preparation_text')
                  },
                  {
                    step: "02",
                    title: t('about.material_selection'),
                    description: t('about.material_selection_text')
                  },
                  {
                    step: "03",
                    title: t('about.precision_printing'),
                    description: t('about.precision_printing_text')
                  },
                  {
                    step: "04",
                    title: t('about.quality_control'),
                    description: t('about.quality_control_text')
                  }
                ].map((item, index) => (
                  <div key={index} className="relative">
                    <div className="font-extrabold text-5xl text-gray-200 mb-4">{item.step}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-10 right-0 transform translate-x-1/2 translate-y-1/2">
                        <ChevronRight className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white">{t('about.cta_title')}</h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              {t('about.cta_description')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-blue-50 font-medium">
                <Link href="/calculator">{t('about.get_quote')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-primary hover:bg-opacity-20 font-medium">
                <Link href="/contact">{t('about.contact_us')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
