import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, TextField, MenuItem, Pagination, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { value: 'createdAt-desc', label: 'Νεότερα πρώτα' },
  { value: 'createdAt-asc', label: 'Παλαιότερα πρώτα' },
  { value: 'price-asc', label: 'Τιμή (αύξουσα)' },
  { value: 'price-desc', label: 'Τιμή (φθίνουσα)' },
  { value: 'name-asc', label: 'Όνομα (Α-Ω)' },
  { value: 'name-desc', label: 'Όνομα (Ω-Α)' }
];

const ProductsPage: React.FC = () => {
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  const { categories } = useCategories();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  
  // Φόρτωση των προϊόντων με τα τρέχοντα φίλτρα
  useEffect(() => {
    const [sortBy, order] = sortOption.split('-');
    
    fetchProducts({
      search: search || undefined,
      category: selectedCategory || undefined,
      sortBy,
      order: order as 'asc' | 'desc',
      page
    });
  }, [fetchProducts, search, selectedCategory, sortOption, page]);
  
  // Χειρισμός αλλαγής κατηγορίας
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };
  
  // Χειρισμός αλλαγής ταξινόμησης
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
    setPage(1);
  };
  
  // Χειρισμός αλλαγής αναζήτησης
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };
  
  // Χειρισμός αλλαγής σελίδας
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Προϊόντα
      </Typography>
      
      {/* Φίλτρα και αναζήτηση */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Αναζήτηση"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Κατηγορία</InputLabel>
            <Select
              value={selectedCategory}
              label="Κατηγορία"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">Όλες οι κατηγορίες</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Ταξινόμηση</InputLabel>
            <Select
              value={sortOption}
              label="Ταξινόμηση"
              onChange={handleSortChange}
            >
              {sortOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Προβολή προϊόντων */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ my: 4 }}>
          <Typography>Δεν βρέθηκαν προϊόντα.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map(product => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  discount={product.discount}
                  imageUrl={product.imageUrl}
                  featured={product.featured}
                  categoryName={product.category?.name}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Σελιδοποίηση */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage; 