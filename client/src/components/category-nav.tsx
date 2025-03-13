import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { 
  Shapes, 
  Home, 
  Cog, 
  Wrench, 
  Gamepad, 
  Lightbulb 
} from "lucide-react";

const getCategoryIcon = (icon: string) => {
  switch (icon) {
    case 'chess-knight':
      return <Shapes className="h-5 w-5" />;
    case 'home':
      return <Home className="h-5 w-5" />;
    case 'cogs':
      return <Cog className="h-5 w-5" />;
    case 'wrench':
      return <Wrench className="h-5 w-5" />;
    case 'gamepad':
      return <Gamepad className="h-5 w-5" />;
    case 'lightbulb':
      return <Lightbulb className="h-5 w-5" />;
    default:
      return <Cog className="h-5 w-5" />;
  }
};

const CategoryNav = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center animate-pulse">
                <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
                <div className="mt-2 bg-gray-200 h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4 scrollbar-hide">
          {categories?.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`}>
              <a className="flex-shrink-0 flex flex-col items-center group">
                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                  {getCategoryIcon(category.icon || '')}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">{category.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
