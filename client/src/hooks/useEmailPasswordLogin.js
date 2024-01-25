// useEmailPasswordLogin.js
import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export const useEmailPasswordLogin = () => {
  const { dispatch: dispatchAuth } = useAuthContext();
  const { dispatchUser } = useUserContext();
  const [emailPasswordError, setEmailPasswordError] = useState(null);
  const [emailPasswordLoading, setEmailPasswordLoading] = useState(false);
  const API_URL = "http://localhost:5000/api/v1/login";
  const navigate = useNavigate();

  const emailPasswordLogin = async (email, password) => {
    setEmailPasswordLoading(true);
    setEmailPasswordError(null);

    try {
      const response = await axios.post(
        API_URL,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data
      const dataError = data.error || "An error occurred during login.";

      if (response.status === 200) {  // Handle successful backend response
        setEmailPasswordLoading(false);
        // Extract the information
        const { email, fullname, token } = data;
        // Create a user object with the necessary information
        const userData = { email, fullname, token };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        // Dispatch to AuthContext
        dispatchAuth({ type: "LOGIN", payload: userData });

        // Dispatch to UserContext
        dispatchUser({ type: 'SET_USER', payload: userData});
        
        navigate("/cart");
      } else {  // Handle unexpected structure in backend response
        setEmailPasswordLoading(false);
        setEmailPasswordError(dataError);
        console.error(dataError);
      }
    } catch (error) {
      setEmailPasswordLoading(false);
      const serverError = error.response?.data?.error;

      if (serverError) {
        // Specific error message from the backend
        setEmailPasswordError(serverError);
        console.error("Server error during login:", serverError);
      } else {
        // Unexpected response from the backend
        setEmailPasswordError("An unexpected error occurred during login.");
        console.error("Unexpected error in server:", error.response?.data);
      }
    } finally {
      setEmailPasswordLoading(false);
    }
  };

  return { emailPasswordLogin, emailPasswordLoading, emailPasswordError };
};