import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  imageUrl?: string;
  featured?: boolean;
  categoryName?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  discount,
  imageUrl,
  featured,
  categoryName
}) => {
  const navigate = useNavigate();
  
  // Υπολογισμός της τελικής τιμής με έκπτωση
  const finalPrice = discount ? price - (price * discount) : price;
  
  // Προσθήκη προεπιλεγμένης εικόνας αν δεν υπάρχει
  const productImage = imageUrl || '/images/product-placeholder.jpg';
  
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: 3,
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      {featured && (
        <Chip 
          label="Προτεινόμενο" 
          color="primary" 
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
        />
      )}
      
      <CardMedia
        component="img"
        height="180"
        image={productImage}
        alt={name}
        sx={{ objectFit: 'contain', p: 2 }}
      />
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {categoryName && (
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {categoryName}
          </Typography>
        )}
        
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box>
            {discount ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {price.toFixed(2)}€
                </Typography>
                <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                  {finalPrice.toFixed(2)}€
                </Typography>
              </>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {price.toFixed(2)}€
              </Typography>
            )}
          </Box>
          
          <Button 
            size="small" 
            variant="contained" 
            onClick={() => navigate(`/products/${id}`)}
          >
            Λεπτομέρειες
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 