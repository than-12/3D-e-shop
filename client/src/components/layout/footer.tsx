import { Link } from "wouter";
import { Box, Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <Box className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold text-white">3D PrintCraft</span>
            </div>
            <p className="text-gray-400 text-base">
              Professional 3D printing services for prototypes, models, and custom designs. Quality prints with fast turnaround times.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Products</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/products?category=figurines">
                      <a className="text-base text-gray-400 hover:text-white">Figurines</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=home-decor">
                      <a className="text-base text-gray-400 hover:text-white">Home Decor</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=gadgets">
                      <a className="text-base text-gray-400 hover:text-white">Gadgets</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator">
                      <a className="text-base text-gray-400 hover:text-white">Custom Orders</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/calculator">
                      <a className="text-base text-gray-400 hover:text-white">Pricing</a>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Documentation</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Guide</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">FAQ</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about">
                      <a className="text-base text-gray-400 hover:text-white">About</a>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Blog</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Jobs</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Press</a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Contact</h3>
                <ul className="mt-4 space-y-4">
                  <li className="flex">
                    <MapPin className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">123 Printing Way<br />New York, NY 10001</span>
                  </li>
                  <li className="flex">
                    <Phone className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">(123) 456-7890</span>
                  </li>
                  <li className="flex">
                    <Mail className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">info@3dprintcraft.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} 3D PrintCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
