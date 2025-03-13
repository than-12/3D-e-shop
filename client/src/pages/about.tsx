import { ChevronRight, Printer, Wrench, Award, Truck, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">About 3D PrintCraft</h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                Where innovation meets craftsmanship. We're a team of passionate 3D printing enthusiasts dedicated to bringing your ideas to life.
              </p>
              <div className="mt-10">
                <Button asChild size="lg" className="font-medium">
                  <Link href="/contact">Get in Touch</Link>
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
              <h2 className="text-3xl font-extrabold text-gray-900">Our Story</h2>
              <div className="mt-6 text-gray-600 space-y-4">
                <p>
                  3D PrintCraft was founded in 2018 by a group of engineers and designers who saw the potential of additive manufacturing to revolutionize how products are designed, prototyped, and manufactured.
                </p>
                <p>
                  What started as a small operation in a garage has grown into a full-scale 3D printing service, equipped with a fleet of high-precision printers and a team of skilled technicians.
                </p>
                <p>
                  Our mission is to make professional 3D printing accessible to everyone – from hobbyists and small businesses to large corporations. We believe in the power of turning digital ideas into tangible objects.
                </p>
              </div>
              <div className="mt-8">
                <Button variant="outline" asChild className="group">
                  <Link href="/products">
                    Explore Our Products
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
            <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Printer className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously explore new techniques and technologies to push the boundaries of what's possible with 3D printing.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality</h3>
                <p className="text-gray-600">
                  Every print is meticulously crafted and inspected to ensure the highest standards of precision and durability.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reliability</h3>
                <p className="text-gray-600">
                  We deliver on our promises with accurate cost estimates, consistent quality, and quick turnaround times.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Craftsmanship</h3>
                <p className="text-gray-600">
                  Our skilled technicians bring years of experience and an eye for detail to every project.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Passion</h3>
                <p className="text-gray-600">
                  We genuinely love what we do and are excited about helping our customers bring their ideas to life.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  We're committed to supporting the maker community through education, collaboration, and sharing resources.
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
            <h2 className="text-3xl font-extrabold text-gray-900">Our Process</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              From digital model to finished product
            </p>
          </div>
          
          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-lg font-medium text-gray-900">
                  How We Work
                </span>
              </div>
            </div>
            
            <div className="mt-12 grid gap-12 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "File Preparation",
                  description: "We analyze your STL file for printability and suggest optimizations to ensure the best possible result."
                },
                {
                  step: "02",
                  title: "Material Selection",
                  description: "Based on your project requirements, we help you choose the perfect material for durability, appearance, and function."
                },
                {
                  step: "03",
                  title: "Precision Printing",
                  description: "Using state-of-the-art equipment, we print your design with precision down to 0.1mm layer height."
                },
                {
                  step: "04",
                  title: "Quality Control",
                  description: "Every print undergoes rigorous quality checks before finishing touches are applied and your item is carefully packaged."
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
          <h2 className="text-3xl font-extrabold text-white">Ready to bring your ideas to life?</h2>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
            Whether you have a complete design or just a concept, we're here to help you every step of the way.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-blue-50 font-medium">
              <Link href="/calculator">Get a Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-primary hover:bg-opacity-20 font-medium">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
