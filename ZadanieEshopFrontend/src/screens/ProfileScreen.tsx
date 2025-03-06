import * as React from "react";
import {
  Typography,
  Box,
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
  Modal,
} from "@mui/material";
import { getOrders, deleteOrder } from "../utils/api";
import {
  ErrorResponse,
  OrdersResponse,
  GetOrdersSearchParams,
} from "../utils/apiTypes";

interface Order {
  _id: string;
  email: string;
  status: string;
  created_at: string;
  total_price: number;
  products: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

function ProfileScreen() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [email, setEmail] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [itemsPerPage, setItemsPerPage] = React.useState<string>("3");
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [page, setPage] = React.useState<number>(1);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [modalTitle, setModalTitle] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  React.useEffect(() => {
    const fetchOrders = async () => {
      const response = await getOrders({
        page: page,
        limit: Number(itemsPerPage),
        filter_email: email,
        filter_status: filterStatus,
      });
      if (response.result) {
        setOrders((response as OrdersResponse).data.orders);
        setTotalPages((response as OrdersResponse).data.total_pages);
      }
    };

    fetchOrders();
  }, []);

  const handleEmailChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(event.target.value);
    const searchParams: GetOrdersSearchParams = {
      page: page,
      limit: Number(itemsPerPage),
      filter_email: event.target.value,
      filter_status: filterStatus,
    };

    const response = await getOrders(searchParams);
    if (response.result) {
      setOrders((response as OrdersResponse).data.orders);
      setTotalPages((response as OrdersResponse).data.total_pages);
    }
  };

  const handleFilterStatusChange = async (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value as string;
    setFilterStatus(newStatus);
    const searchParams: GetOrdersSearchParams = {
      page: page,
      limit: Number(itemsPerPage),
      filter_email: email,
      filter_status: newStatus,
    };

    const response = await getOrders(searchParams);
    if (response.result) {
      setOrders((response as OrdersResponse).data.orders);
      setTotalPages((response as OrdersResponse).data.total_pages);
    }
  };

  const handleItemsPerPageChange = async (event: SelectChangeEvent<string>) => {
    const newItemsPerPage = event.target.value as string;
    setItemsPerPage(newItemsPerPage);
    const searchParams: GetOrdersSearchParams = {
      page: page,
      limit: Number(newItemsPerPage),
      filter_email: email,
      filter_status: filterStatus,
    };

    const response = await getOrders(searchParams);
    if (response.result) {
      setOrders((response as OrdersResponse).data.orders);
      setTotalPages((response as OrdersResponse).data.total_pages);
    }
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    const searchParams: GetOrdersSearchParams = {
      page: value,
      limit: Number(itemsPerPage),
      filter_email: email,
      filter_status: filterStatus,
    };

    const response = await getOrders(searchParams);
    if (response.result) {
      setOrders((response as OrdersResponse).data.orders);
      setTotalPages((response as OrdersResponse).data.total_pages);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const response = await deleteOrder({ order_id: order._id });
    if (response.result) {
      const response = await getOrders({
        page: page,
        limit: Number(itemsPerPage),
        filter_email: email,
        filter_status: filterStatus,
      });
      if (response.result) {
        setOrders((response as OrdersResponse).data.orders);
        setTotalPages((response as OrdersResponse).data.total_pages);
      }
    } else {
      setModalTitle("An error occurred while cancelling the order.");
      setError((response as ErrorResponse).error);
      handleOpen();
    }
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ color: "black" }}
          >
            {modalTitle}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, color: "black" }}
          >
            {error}
          </Typography>
        </Box>
      </Modal>

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
          label="Sign in email"
          variant="outlined"
          size="small"
          value={email}
          onChange={handleEmailChange}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Order state</InputLabel>
          <Select
            value={filterStatus}
            onChange={handleFilterStatusChange}
            label="Order state"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Orders per page</InputLabel>
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

      {orders.length > 0 && (
        <Box sx={{ pt: 4 }}>
          <Grid
            container
            spacing={4}
            direction="column"
            alignItems="center"
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {orders.map((order) => (
              <Grid item xs={12} key={order._id} sx={{ width: "100%" }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography sx={{ color: "black" }}>
                          {order.email}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography variant="h6">
                          {new Date(order.created_at).toLocaleString("sk")}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          {order.status === "unpaid" && "Unpaid"}
                          {order.status === "cancelled" && "Cancelled"}
                        </Typography>
                      </Grid>

                      {order.products.map((product) => (
                        <Grid container xs={12} alignItems="center" key={order._id + product._id}>
                          <Grid
                            item
                            xs={4}
                            container
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Typography sx={{ color: "black" }}>
                              {product.name}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={4}
                            container
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Typography sx={{ color: "black" }}>
                              {product.quantity}x
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={4}
                            container
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Typography sx={{ color: "black" }}>
                              {product.price.toFixed(2)}€
                            </Typography>
                          </Grid>
                        </Grid>
                      ))}

                      <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Typography
                          variant="h5"
                          color="primary"
                          style={{ marginTop: "10px" }}
                        >
                          {order.total_price}€
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Button
                          variant="contained"
                          color="error"
                          fullWidth
                          disabled={order.status === "cancelled"}
                          onClick={() => {
                            handleCancelOrder(order);
                          }}
                          sx={{ mt: 2 }}
                        >
                          Cancel order
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {orders.length === 0 && (
        <Typography variant="h5" color="primary" style={{ marginTop: "64" }}>
          No orders matching your filter...
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "32px",
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

export default ProfileScreen;
