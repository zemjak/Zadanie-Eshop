import * as React from "react";
import "./App.css";
import { Storefront, ShoppingCart, AccountCircle } from "@mui/icons-material";
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Typography,
  Toolbar,
  Container,
} from "@mui/material";
import ProductsScreen from "./screens/ProductsScreen";
import ShoppingCartScreen from "./screens/ShoppingCartScreen";
import ProfileScreen from "./screens/ProfileScreen";

function App() {
  const [tabIndex, setTabIndex] = React.useState<number>(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <>
      {/* Top App Bar */}
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Awesome Shop
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab icon={<Storefront />} label="Products" />
            <Tab icon={<ShoppingCart />} label="Shopping Cart" />
            <Tab icon={<AccountCircle />} label="Profile" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ mt: 4, textAlign: "center" }}>
          {tabIndex === 0 && <ProductsScreen />}
          {tabIndex === 1 && <ShoppingCartScreen />}
          {tabIndex === 2 && <ProfileScreen />}
        </Box>
      </Container>
    </>
  );
}

export default App;
