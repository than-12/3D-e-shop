import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';

interface ProductListProps {
  initialCategory?: string;
  initialSearch?: string;
  itemsPerPage?: number;
}

const ProductList: React.FC<ProductListProps> = ({
  initialCategory,
  initialSearch,
  itemsPerPage = 8
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  
  const {
    products,
    loading,
    error,
    pagination,
    fetchProducts
  } = useProducts();
  
  // Debugging - Εμφάνιση κατάστασης component
  console.log('ProductList rendering with:', { 
    products, 
    loading, 
    error, 
    pagination, 
    currentPage, 
    selectedCategory, 
    searchQuery 
  });
  
  // Φορτώνει τα προϊόντα όταν αλλάζουν τα φίλτρα ή η σελίδα
  useEffect(() => {
    console.log('ProductList useEffect triggered with:', {
      selectedCategory,
      searchQuery,
      currentPage,
      itemsPerPage
    });
    
    fetchProducts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: itemsPerPage
    }).then(result => {
      console.log('fetchProducts completed, result:', result);
    }).catch(err => {
      console.error('Error in fetchProducts:', err);
    });
  }, [fetchProducts, selectedCategory, searchQuery, currentPage, itemsPerPage]);
  
  // Χειριστές για την πλοήγηση σελίδας
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
  
  // Χειριστής για την αλλαγή κατηγορίας
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Επαναφορά στην πρώτη σελίδα όταν αλλάζει η κατηγορία
  };
  
  // Χειριστής για την αναζήτηση
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1); // Επαναφορά στην πρώτη σελίδα όταν υποβάλλεται νέα αναζήτηση
    fetchProducts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      page: 1,
      limit: itemsPerPage
    });
  };

  // Δημιουργία URL για την εικόνα προϊόντος
  const getImageUrl = (product: Product) => {
    if (product.imageUrl) {
      // Έλεγχος αν η διεύθυνση είναι σχετική ή απόλυτη
      return product.imageUrl.startsWith('http') 
        ? product.imageUrl 
        : `http://localhost:3002${product.imageUrl}`;
    }
    return '/images/product-placeholder.jpg'; // Προεπιλεγμένη εικόνα
  };
  
  // Υπολογισμός της τελικής τιμής με έκπτωση
  const getFinalPrice = (price: number, discount?: number) => {
    if (discount) {
      return price - (price * discount);
    }
    return price;
  };

  return (
    <div className="product-list-container">
      {/* Φίλτρα και αναζήτηση */}
      <div className="filters-container" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Αναζήτηση προϊόντων..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              flexGrow: 1
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Αναζήτηση
          </button>
        </form>
      </div>
      
      {/* Κατάσταση φόρτωσης */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Φόρτωση προϊόντων...</p>
        </div>
      )}
      
      {/* Μήνυμα σφάλματος */}
      {error && (
        <div style={{ color: 'red', padding: '1rem', border: '1px solid red', marginBottom: '1rem' }}>
          <p>Σφάλμα: {error}</p>
        </div>
      )}
      
      {/* Κενή λίστα προϊόντων */}
      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Δεν βρέθηκαν προϊόντα.</p>
        </div>
      )}
      
      {/* Λίστα προϊόντων */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="products-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {products.map(product => (
              <div
                key={product.id}
                className="product-card"
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                {/* Εικόνα προϊόντος */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'contain',
                      backgroundColor: '#f8fafc',
                      padding: '1rem'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/product-placeholder.jpg';
                    }}
                  />
                  
                  {/* Ετικέτα προτεινόμενου προϊόντος */}
                  {product.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      Προτεινόμενο
                    </div>
                  )}
                  
                  {/* Ετικέτα έκπτωσης */}
                  {product.discount && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      -{(product.discount * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                
                {/* Πληροφορίες προϊόντος */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {product.category && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {product.category.name}
                    </span>
                  )}
                  
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    color: '#1e293b'
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#475569', 
                      marginBottom: '1rem',
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {product.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end',
                    marginTop: 'auto'
                  }}>
                    <div>
                      {product.discount ? (
                        <>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#94a3b8', 
                            fontSize: '0.875rem',
                            display: 'block'
                          }}>
                            {product.price.toFixed(2)}€
                          </span>
                          <span style={{ 
                            color: '#ef4444', 
                            fontWeight: 'bold',
                            fontSize: '1.125rem'
                          }}>
                            {getFinalPrice(product.price, product.discount).toFixed(2)}€
                          </span>
                        </>
                      ) : (
                        <span style={{ 
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}>
                          {product.price.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    
                    <button
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        fontWeight: 'medium'
                      }}
                      onClick={() => window.location.href = `/products/${product.id}`}
                    >
                      Προβολή
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Σελιδοποίηση */}
          {pagination.pages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: '2rem',
              gap: '0.5rem'
            }}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === 1 ? '#e2e8f0' : '#3b82f6',
                  color: currentPage === 1 ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Προηγούμενη
              </button>
              
              <span style={{ margin: '0 1rem' }}>
                Σελίδα {currentPage} από {pagination.pages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === pagination.pages}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === pagination.pages ? '#e2e8f0' : '#3b82f6',
                  color: currentPage === pagination.pages ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer'
                }}
              >
                Επόμενη
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList; 