import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Home from "./pages/Home";
import Search from "./pages/Search";
import CurrentProduct from "./pages/CurrentProduct";
import Cart from "./pages/Cart";
import BuyNow from "./pages/BuyNow";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/protectedRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<CurrentProduct />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/buy-now" element={<BuyNow />} />
        </Route>
      </Routes>
    </>
  );
}
