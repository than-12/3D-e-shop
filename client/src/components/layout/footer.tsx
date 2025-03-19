import { Link } from "wouter";
import { Box, Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const Footer = () => {
  const { t } = useLanguage();
  
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
              {t('footer.company_description')}
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">{t('footer.products')}</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/products?category=figurines" className="text-base text-gray-400 hover:text-white">
                      {t('categories.figurines')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=home-decor" className="text-base text-gray-400 hover:text-white">
                      {t('categories.home-decor')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=gadgets" className="text-base text-gray-400 hover:text-white">
                      {t('categories.gadgets')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator" className="text-base text-gray-400 hover:text-white">
                      {t('footer.custom_orders')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">{t('footer.services')}</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/calculator" className="text-base text-gray-400 hover:text-white">
                      {t('footer.3d_printing')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator" className="text-base text-gray-400 hover:text-white">
                      {t('footer.custom_modeling')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/lithophane" className="text-base text-gray-400 hover:text-white">
                      {t('footer.lithophane')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                      {t('footer.bulk_orders')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">{t('footer.company')}</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about" className="text-base text-gray-400 hover:text-white">
                      {t('footer.about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                      {t('footer.contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                      {t('footer.faq')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-base text-gray-400 hover:text-white">
                      {t('footer.terms')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">{t('contact.contact_title')}</h3>
                <ul className="mt-4 space-y-4">
                  <li className="flex">
                    <MapPin className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">15 Ermou Street<br />Athens, 10563, Greece</span>
                  </li>
                  <li className="flex">
                    <Phone className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">+30 21 0123 4567</span>
                  </li>
                  <li className="flex">
                    <Mail className="text-gray-400 h-5 w-5 mt-1 mr-3" />
                    <span className="text-gray-400">info@3dprintcraft.gr</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            {t('footer.copyright')} {new Date().getFullYear()} 3D PrintCraft.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
