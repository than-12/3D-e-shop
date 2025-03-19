import React, { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  featured?: boolean;
  discount?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ApiResponse {
  statusCode: number;
  data: any;
  error?: string;
}

const DebugProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ApiResponse[]>([]);

  // Συνάρτηση δοκιμής του API
  const testApi = async () => {
    setLoading(true);
    const results: ApiResponse[] = [];

    // 1. Δοκιμή αρχικής διαδρομής του API
    try {
      const response = await fetch('http://localhost:3002/api');
      const data = await response.json();
      results.push({
        statusCode: response.status,
        data
      });
    } catch (err) {
      results.push({
        statusCode: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα'
      });
    }

    // 2. Δοκιμή GET /products
    try {
      const response = await fetch('http://localhost:3002/api/products');
      const data = await response.json();
      results.push({
        statusCode: response.status,
        data
      });

      // Ενημερώνουμε τα προϊόντα αν πέτυχε η κλήση
      if (response.ok && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      results.push({
        statusCode: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα'
      });
    }

    // 3. Δοκιμή GET /categories
    try {
      const response = await fetch('http://localhost:3002/api/categories');
      const data = await response.json();
      results.push({
        statusCode: response.status,
        data
      });
    } catch (err) {
      results.push({
        statusCode: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα'
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    // Εκτέλεση της δοκιμής κατά τη φόρτωση της σελίδας
    testApi();
  }, []);

  // Χειρισμός ανανέωσης της δοκιμής
  const handleRefreshTest = () => {
    testApi();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Debugging Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleRefreshTest}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Εκτέλεση δοκιμών API
        </button>
        
        <a 
          href="/debug-products" 
          style={{
            padding: '10px 15px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Ανανέωση σελίδας
        </a>
      </div>
      
      {loading && (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p>Εκτέλεση δοκιμών...</p>
        </div>
      )}
      
      {!loading && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Αποτελέσματα δοκιμών API</h2>
          
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{ 
                marginBottom: '15px', 
                padding: '15px', 
                backgroundColor: result.statusCode >= 200 && result.statusCode < 300 ? '#e8f5e9' : '#ffebee',
                borderRadius: '4px',
                border: `1px solid ${result.statusCode >= 200 && result.statusCode < 300 ? '#81c784' : '#ef5350'}`
              }}
            >
              <h3>Δοκιμή {index + 1}</h3>
              <p><strong>Status:</strong> {result.statusCode || 'Error'}</p>
              
              {result.error ? (
                <p><strong>Error:</strong> {result.error}</p>
              ) : (
                <div>
                  <p><strong>Data:</strong></p>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto', 
                    maxHeight: '200px' 
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <h2>Προϊόντα</h2>
      
      {loading && <p>Φόρτωση προϊόντων...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
        <p>Δεν βρέθηκαν προϊόντα.</p>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px' }}>{product.name}</h3>
            {product.category && (
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                Κατηγορία: {product.category.name}
              </div>
            )}
            {product.description && (
              <p style={{ margin: '10px 0', color: '#333' }}>{product.description}</p>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '15px'
            }}>
              <div>
                <strong style={{ fontSize: '18px', color: '#e63946' }}>
                  {product.price.toFixed(2)}€
                </strong>
                {product.discount && (
                  <span style={{ 
                    marginLeft: '8px', 
                    backgroundColor: '#e63946', 
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    -{(product.discount * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div style={{ 
                color: product.stock > 0 ? 'green' : 'red',
                fontSize: '14px'
              }}>
                {product.stock > 0 ? `Διαθέσιμο (${product.stock})` : 'Εξαντλήθηκε'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugProductsPage; 