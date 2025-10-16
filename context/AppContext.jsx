"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
export const AppContext = createContext();
export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(true);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    try {
      if (user.publicMetadata === "seller") {
        setIsSeller(true);
      }

      setProducts(productsDummyData);
    } catch (error) {
      console.log(error);
    }
  };

  //   const fetchUserData = async () => {
  //     setUserData(userDummyData);
  //   };

 const fetchUserData = async () => {
  try {
    if (!user) {
      console.log("No user found");
      return;
    }

    // Check if user is seller - fix the condition
    if (user.publicMetadata?.role === "seller") {
      setIsSeller(true);
    } else {
      setIsSeller(false);
    }

    const token = await getToken();
    const response = await axios.get("/api/user/data", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Response data is in response.data
    const { data } = response;

    if (data.success) {
      setUserData(data.user);
      setCartItems(data.user.cartItems || {});
    } else {
      toast.error(data.message || "Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    
    // More specific error handling
    if (error.response?.status === 404) {
      toast.error("User profile not found. Please try again.");
    } else if (error.response?.status === 401) {
      toast.error("Please sign in again.");
    } else {
      toast.error(error.response?.data?.message || "An error occurred while fetching user data");
    }
  }
};

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
