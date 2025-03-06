import * as React from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import { getProducts } from "../utils/api";
import {
  ErrorResponse,
  ProductsResponse,
  GetProductSearchParams,
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

function ProductsScreen() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<string>("3");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");

  React.useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts({
        page: page,
        limit: Number(itemsPerPage),
      });
      if (!response.result) {
        setError((response as ErrorResponse).error);
      } else {
        setProducts((response as ProductsResponse).data.products);
        setTotalPages((response as ProductsResponse).data.total_pages);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    const savedCart = localStorage.getItem("cart");
    var cart: Cart;
    if (savedCart) {
      cart = JSON.parse(savedCart);
    } else {
      cart = {};
    }

    const newCart = { ...cart };
    newCart[product._id] = {
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      quantity: Math.min(
        (newCart[product._id]?.quantity || 0) + 1,
        product.stock
      ),
    };

    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setLoading(true);
    setPage(value);

    const searchParams: GetProductSearchParams = {
      page: value,
      limit: Number(itemsPerPage),
      name_query: searchTerm,
    };
    switch (sortBy) {
      case "name":
        searchParams.order_by = "name";
        searchParams.order = "asc";
        break;
      case "cheapest":
        searchParams.order_by = "price";
        searchParams.order = "asc";
        break;
      case "expensive":
        searchParams.order_by = "price";
        searchParams.order = "desc";
        break;
      case "orders":
        searchParams.order_by = "units_sold";
        searchParams.order = "desc";
        break;
    }

    const response = await getProducts(searchParams);
    if (!response.result) {
      setError((response as ErrorResponse).error);
    } else {
      setProducts((response as ProductsResponse).data.products);
      setTotalPages((response as ProductsResponse).data.total_pages);
      if ((response as ProductsResponse).data.total_pages < page) {
        setPage(totalPages);
      }
    }
    setLoading(false);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading(true);
    setSearchTerm(event.target.value);

    const searchParams: GetProductSearchParams = {
      page: page,
      limit: Number(itemsPerPage),
      name_query: event.target.value,
    };
    switch (sortBy) {
      case "name":
        searchParams.order_by = "name";
        searchParams.order = "asc";
        break;
      case "cheapest":
        searchParams.order_by = "price";
        searchParams.order = "asc";
        break;
      case "expensive":
        searchParams.order_by = "price";
        searchParams.order = "desc";
        break;
      case "orders":
        searchParams.order_by = "units_sold";
        searchParams.order = "desc";
        break;
    }

    const response = await getProducts(searchParams);
    if (!response.result) {
      setError((response as ErrorResponse).error);
    } else {
      setProducts((response as ProductsResponse).data.products);
      setTotalPages((response as ProductsResponse).data.total_pages);
      if ((response as ProductsResponse).data.total_pages < page) {
        setPage(totalPages);
      }
    }
    setLoading(false);
  };

  const handleSortChange = async (event: SelectChangeEvent<string>) => {
    const newSortBy = event.target.value as string;
    setLoading(true);
    setSortBy(newSortBy);

    const searchParams: GetProductSearchParams = {
      page: page,
      limit: Number(itemsPerPage),
      name_query: searchTerm,
    };
    switch (newSortBy) {
      case "name":
        searchParams.order_by = "name";
        searchParams.order = "asc";
        break;
      case "cheapest":
        searchParams.order_by = "price";
        searchParams.order = "asc";
        break;
      case "expensive":
        searchParams.order_by = "price";
        searchParams.order = "desc";
        break;
      case "orders":
        searchParams.order_by = "units_sold";
        searchParams.order = "desc";
        break;
    }

    const response = await getProducts(searchParams);
    if (!response.result) {
      setError((response as ErrorResponse).error);
    } else {
      setProducts((response as ProductsResponse).data.products);
      setTotalPages((response as ProductsResponse).data.total_pages);
      if ((response as ProductsResponse).data.total_pages < page) {
        setPage(totalPages);
      }
    }
    setLoading(false);
  };

  const handleItemsPerPageChange = async (event: SelectChangeEvent<string>) => {
    const newItemsPerPage = event.target.value as string;
    setLoading(true);
    setItemsPerPage(newItemsPerPage);

    const searchParams: GetProductSearchParams = {
      page: page,
      limit: Number(newItemsPerPage),
      name_query: searchTerm,
    };
    switch (sortBy) {
      case "name":
        searchParams.order_by = "name";
        searchParams.order = "asc";
        break;
      case "cheapest":
        searchParams.order_by = "price";
        searchParams.order = "asc";
        break;
      case "expensive":
        searchParams.order_by = "price";
        searchParams.order = "desc";
        break;
      case "orders":
        searchParams.order_by = "units_sold";
        searchParams.order = "desc";
        break;
    }

    const response = await getProducts(searchParams);
    if (!response.result) {
      setError((response as ErrorResponse).error);
    } else {
      setProducts((response as ProductsResponse).data.products);
      setTotalPages((response as ProductsResponse).data.total_pages);
      if ((response as ProductsResponse).data.total_pages < page) {
        setPage(totalPages);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          padding: "10px",
          marginTop: "32px",
        }}
      >
        <TextField
          label="Search product"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="Sort by">
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="cheapest">Cheapest</MenuItem>
            <MenuItem value="expensive">Most Expensive</MenuItem>
            <MenuItem value="orders">Orders Placed</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Products per page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Products per page"
          >
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="25">25</MenuItem>
            <MenuItem value="50">50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {products.length > 0 && (
        <Box sx={{ pt: 4 }}>
          <Grid
            container
            spacing={4}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={product._id}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.stock > 0 && `${product.stock} in stock`}
                      {product.stock === 0 && "Currently out of stock"}
                    </Typography>
                    <Typography
                      variant="h5"
                      color="primary"
                      style={{ marginTop: "10px" }}
                    >
                      {product.price}€
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={product.stock === 0}
                      sx={{ mt: 2 }}
                      onClick={() => {
                        addToCart(product);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {products.length === 0 && (
        <Typography variant="h5" color="primary" style={{ marginTop: "64" }}>
          No product matching your filter...
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "32px",
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default ProductsScreen;
