import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Grid, Typography, Box, Button, Divider, Paper, Chip, CircularProgress, Breadcrumbs, Link } from '@mui/material';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

// Διόρθωση του τύπου για το useParams
type ProductDetailParams = {
  id: string;
};

const ProductDetailPage: React.FC = () => {
  // Διόρθωση του τρόπου κλήσης του useParams για συμβατότητα
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const location = useLocation();
  const { fetchProduct } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (id) {
          const productData = await fetchProduct(id);
          if (productData) {
            // Εδώ χρησιμοποιούμε το setProduct με σωστό τύπο
            setProduct(productData as Product);
          } else {
            setError('Το προϊόν δεν βρέθηκε.');
          }
        } else {
          setError('Άκυρο αναγνωριστικό προϊόντος.');
        }
      } catch (err) {
        setError('Σφάλμα κατά τη φόρτωση του προϊόντος.');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, fetchProduct]);
  
  // Υπολογισμός της τελικής τιμής με έκπτωση
  const finalPrice = product?.discount 
    ? product.price - (product.price * product.discount) 
    : product?.price;
  
  // Προσθήκη προεπιλεγμένης εικόνας αν δεν υπάρχει
  const productImage = product?.imageUrl || '/images/product-placeholder.jpg';
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Αρχική
        </Link>
        <Link color="inherit" href="/products">
          Προϊόντα
        </Link>
        {product?.category && (
          <Link color="inherit" href={`/products?category=${product.categoryId}`}>
            {product.category.name}
          </Link>
        )}
        <Typography color="text.primary">
          {product?.name || 'Λεπτομέρειες προϊόντος'}
        </Typography>
      </Breadcrumbs>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, my: 2 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      ) : product ? (
        <Grid container spacing={4}>
          {/* Εικόνα προϊόντος */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={productImage}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          
          {/* Πληροφορίες προϊόντος */}
          <Grid item xs={12} md={6}>
            <Box>
              {product.featured && (
                <Chip 
                  label="Προτεινόμενο" 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
              )}
              
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              
              {product.category && (
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Κατηγορία: {product.category.name}
                </Typography>
              )}
              
              <Box sx={{ my: 3 }}>
                {product.discount ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {product.price.toFixed(2)}€
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="error.main" 
                      sx={{ fontWeight: 'bold' }}
                    >
                      {finalPrice?.toFixed(2)}€
                    </Typography>
                    <Chip 
                      label={`-${(product.discount * 100).toFixed(0)}%`} 
                      color="error" 
                      size="small" 
                    />
                  </Box>
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {product.price.toFixed(2)}€
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" sx={{ my: 2 }}>
                {product.description || 'Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το προϊόν.'}
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" gutterBottom>
                  Διαθεσιμότητα: {product.stock > 0 ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>
                      Σε απόθεμα ({product.stock} τεμάχια)
                    </span>
                  ) : (
                    <span style={{ color: 'red' }}>Εξαντλήθηκε</span>
                  )}
                </Typography>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  disabled={product.stock <= 0}
                >
                  Προσθήκη στο καλάθι
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, my: 2 }}>
          <Typography align="center">
            Το προϊόν δεν βρέθηκε.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ProductDetailPage; 