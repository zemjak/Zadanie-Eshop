import React from "react";
import { Button, TextField, Grid, Typography } from "@mui/material";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
};

interface CartItemProps {
  product: Product & { quantity: number };
  onQuantityChange: (newQuantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ product, onQuantityChange }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>{product.name}</Typography>
      </Grid>
      <Grid item xs={3} container justifyContent="center" alignItems="center">
        <TextField
          type="number"
          value={product.quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          inputProps={{ min: 1, max: product.stock }}
        />
      </Grid>
      <Grid item xs={2} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>
          {product.price.toFixed(2)}€
        </Typography>
      </Grid>
      <Grid item xs={2} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>
          {(product.price * product.quantity).toFixed(2)}€
        </Typography>
      </Grid>
      <Grid item xs={2} container justifyContent="center" alignItems="center">
        <Button color="error" variant="contained"
        onClick={() => onQuantityChange(0)}
        >Remove</Button>
      </Grid>
    </Grid>
  );
};

export default CartItem;
