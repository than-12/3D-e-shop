import React from 'react';
import ProductList from '../components/ProductList';
import { useCategories } from '../hooks/useCategories';

const ProductCatalog: React.FC = () => {
  const { categories } = useCategories();
  
  return (
    <div className="container" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '2rem',
        color: '#1e293b',
        textAlign: 'center'
      }}>
        Κατάλογος Προϊόντων
      </h1>
      
      {/* Εισαγωγή του ProductList component */}
      <ProductList itemsPerPage={8} />
      
      {/* Ίσως προσθέσετε περισσότερο περιεχόμενο εδώ, όπως προτάσεις ή δημοφιλή προϊόντα */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          color: '#1e293b'
        }}>
          Κατηγορίες Προϊόντων
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {categories.map(category => (
            <div 
              key={category.id}
              style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => window.location.href = `/products?category=${category.id}`}
            >
              <h3 style={{ fontWeight: 'bold', color: '#1e293b' }}>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog; 