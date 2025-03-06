import React, { useState } from "react";
import {
  Button,
  Typography,
  Divider,
  Grid,
  Box,
  TextField,
  Modal,
} from "@mui/material";
import CartItem from "./CartItem";
import { createOrder } from "../utils/api";
import {
  CreateOrderRequest,
  ErrorResponse
} from "../utils/apiTypes";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
};

type Cart = {
  [productId: string]: Product & { quantity: number };
};

function ShoppingCartScreen() {
  const [products, setProducts] = useState<Cart>({});
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!email && !localStorage.getItem("cart")) {
      setProducts({});
    }
    setOpen(false);
  }
  const [modalTitle, setModalTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  React.useEffect(() => {
    const fetchProducts = async () => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setProducts(JSON.parse(savedCart));
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (product: Product, newQuantity: number) => {
    const updatedProducts = { ...products };
    updatedProducts[product._id].quantity = newQuantity;
    if (newQuantity === 0) {
      delete updatedProducts[product._id];
    }

    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedProducts));
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(event.target.value);
  }

  const calculateTotal = (cart: Cart): number => {
    return Object.values(cart).reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setModalTitle("An error occurred while creating the order.");
      setError("User email can not be empty.");
      handleOpen();
      return;
    }

    const createOrderRequest: CreateOrderRequest = {email: emailTrimmed, products: []}
    for (const product_id in products) {
      if (products.hasOwnProperty(product_id)) {
        createOrderRequest.products.push({id: product_id, quantity: products[product_id].quantity})
      }
    }

    const response = await createOrder(createOrderRequest);
    if (response.result) {
      setModalTitle("Your order was created successfully!");
      setError("Check all your orders in profile page.");
      setEmail("");
      localStorage.removeItem("cart");
      handleOpen();
    } else {
      setModalTitle("An error occurred while creating the order.");
      setError((response as ErrorResponse).error);
      handleOpen();
    }
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  if (Object.keys(products).length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" sx={{ color: "black" }}>
          Your shopping cart is empty...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: "32px" }}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: "black" }}>
          {modalTitle}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, color: "black" }}>
            {error}
          </Typography>
        </Box>
      </Modal>

      <Grid container justifyContent="flex-end" spacing={2}>
      <Grid item xs={3} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>Product Name</Typography>
      </Grid>
      <Grid item xs={3} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>Quantity</Typography>
      </Grid>
      <Grid item xs={2} container justifyContent="center" alignItems="center">
        <Typography sx={{ color: "black" }}>Subtotal</Typography>
      </Grid>
        <Grid item xs={2} container justifyContent="center">
          <Typography variant="h6" sx={{ color: "black" }}>
            Total:
          </Typography>
        </Grid>
        <Grid item xs={2} container justifyContent="center">
        </Grid>
      </Grid>
      <Divider sx={{ marginY: 2 }} />
      {Object.values(products).map((product) => (
        <Box
          key={product._id}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <CartItem
            product={product}
            onQuantityChange={(newQuantity) =>
              handleQuantityChange(product, newQuantity)
            }
          />
          <Divider sx={{ marginY: 2 }} />
        </Box>
      ))}
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item xs={8} container justifyContent="flex-start">
        <TextField
          label="Enter order email"
          variant="outlined"
          size="small"
          value={email}
          onChange={handleEmailChange}
        />
        </Grid>
        <Grid item xs={2} container justifyContent="center">
          <Typography variant="h6" sx={{ color: "black" }}>
            {calculateTotal(products).toFixed(2)}€
          </Typography>
        </Grid>
        <Grid item xs={2} container justifyContent="center">
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitOrder}
          >
            Submit Order
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ShoppingCartScreen;
