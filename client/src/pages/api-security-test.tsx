import React, { useState } from 'react';

interface TestResult {
  endpoint: string;
  status: number;
  data: any;
  error?: string;
  withToken: boolean;
}

const ApiSecurityTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/api/products');
  
  // Συνάρτηση δοκιμής της ασφάλειας του API
  const runSecurityTests = async () => {
    setLoading(true);
    const testResults: TestResult[] = [];
    
    // Δοκιμή 1: Κλήση του /api/products χωρίς token
    try {
      const response = await fetch('http://localhost:3002/api/products', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      testResults.push({
        endpoint: '/api/products',
        status: response.status,
        data,
        withToken: false
      });
    } catch (err) {
      testResults.push({
        endpoint: '/api/products',
        status: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα',
        withToken: false
      });
    }
    
    // Δοκιμή 2: Κλήση του /api/products με ένα άκυρο token
    try {
      const response = await fetch('http://localhost:3002/api/products', {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer invalid_token_1234567890'
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      testResults.push({
        endpoint: '/api/products (με άκυρο token)',
        status: response.status,
        data,
        withToken: true
      });
    } catch (err) {
      testResults.push({
        endpoint: '/api/products (με άκυρο token)',
        status: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα',
        withToken: true
      });
    }
    
    // Δοκιμή 3: Προσπάθεια δημιουργίας προϊόντος χωρίς token
    try {
      const response = await fetch('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Product',
          price: 10.99
        })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      testResults.push({
        endpoint: '/api/products (POST)',
        status: response.status,
        data,
        withToken: false
      });
    } catch (err) {
      testResults.push({
        endpoint: '/api/products (POST)',
        status: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα',
        withToken: false
      });
    }
    
    // Δοκιμή 4: Δοκιμή πρόσβασης σε προστατευμένο admin endpoint
    try {
      const response = await fetch('http://localhost:3002/api/admin/users', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      testResults.push({
        endpoint: '/api/admin/users',
        status: response.status,
        data,
        withToken: false
      });
    } catch (err) {
      testResults.push({
        endpoint: '/api/admin/users',
        status: 0,
        data: null,
        error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα',
        withToken: false
      });
    }
    
    setResults(testResults);
    setLoading(false);
  };
  
  // Συνάρτηση για τη δοκιμή προσαρμοσμένου endpoint
  const testCustomEndpoint = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002${customEndpoint}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      
      setResults(prevResults => [
        ...prevResults,
        {
          endpoint: customEndpoint,
          status: response.status,
          data,
          withToken: false
        }
      ]);
    } catch (err) {
      setResults(prevResults => [
        ...prevResults,
        {
          endpoint: customEndpoint,
          status: 0,
          data: null,
          error: err instanceof Error ? err.message : 'Άγνωστο σφάλμα',
          withToken: false
        }
      ]);
    }
    
    setLoading(false);
  };
  
  // Χειριστής αλλαγής προσαρμοσμένου endpoint
  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEndpoint(e.target.value);
  };
  
  // Χειριστής υποβολής προσαρμοσμένου endpoint
  const handleSubmitEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    testCustomEndpoint();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        Δοκιμή Ασφάλειας API
      </h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={runSecurityTests}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Εκτέλεση δοκιμών...' : 'Εκτέλεση δοκιμών ασφαλείας'}
        </button>
        
        <form 
          onSubmit={handleSubmitEndpoint}
          style={{ display: 'flex', gap: '0.5rem', flexGrow: 1 }}
        >
          <input
            type="text"
            value={customEndpoint}
            onChange={handleEndpointChange}
            placeholder="Διαδρομή του API (π.χ. /api/products)"
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.25rem',
              flexGrow: 1
            }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Δοκιμή
          </button>
        </form>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Εκτελούνται δοκιμές...</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Αποτελέσματα Δοκιμών
          </h2>
          
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>{result.endpoint}</h3>
                <div>
                  <span 
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      backgroundColor: result.status >= 200 && result.status < 300 
                        ? '#bbf7d0' 
                        : result.status === 401 
                          ? '#fde68a' 
                          : '#fecaca',
                      color: result.status >= 200 && result.status < 300 
                        ? '#166534' 
                        : result.status === 401 
                          ? '#854d0e' 
                          : '#b91c1c'
                    }}
                  >
                    {result.status > 0 ? result.status : 'Error'}
                  </span>
                  
                  {result.withToken && (
                    <span 
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        backgroundColor: '#c7d2fe',
                        color: '#4338ca'
                      }}
                    >
                      Με Token
                    </span>
                  )}
                </div>
              </div>
              
              {result.error ? (
                <div 
                  style={{
                    padding: '1rem',
                    backgroundColor: '#fee2e2',
                    borderRadius: '0.25rem',
                    color: '#b91c1c'
                  }}
                >
                  <p><strong>Σφάλμα:</strong> {result.error}</p>
                </div>
              ) : (
                <pre
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontSize: '0.875rem'
                  }}
                >
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              
              <div style={{ marginTop: '1rem' }}>
                <p>
                  <strong>Αποτέλεσμα:</strong>{' '}
                  {result.status === 401 ? (
                    <span style={{ color: '#16a34a' }}>Επιτυχία - Απαιτείται ταυτοποίηση</span>
                  ) : result.status >= 200 && result.status < 300 ? (
                    result.withToken ? (
                      <span style={{ color: '#16a34a' }}>Επιτυχία - Επιτρέπεται η πρόσβαση με token</span>
                    ) : (
                      <span style={{ color: '#ea580c' }}>Προσοχή - Το endpoint είναι δημόσιο</span>
                    )
                  ) : (
                    <span style={{ color: '#dc2626' }}>Σφάλμα - Έλεγχος απέτυχε</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiSecurityTest; 