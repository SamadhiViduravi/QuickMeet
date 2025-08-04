// This file simulates authentication logic.
// In a real application, these functions would interact with your Spring Boot backend.

const AUTH_TOKEN_KEY = "quickmeet_jwt_token"

// Simulate user login
export const loginUser = async (email: string, password: string): Promise<boolean> => {
  // In a real app, this would be a POST request to your Spring Boot /api/auth/login endpoint
  // const response = await fetch('http://localhost:8080/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (response.ok) {
  //   const data = await response.json();
  //   localStorage.setItem(AUTH_TOKEN_KEY, data.token); // Store the JWT token
  //   return true;
  // }
  // return false;

  // Simulate successful login for any non-empty credentials
  if (email && password) {
    // Simulate a JWT token
    const simulatedToken = `fake-jwt-token-for-${email}`
    localStorage.setItem(AUTH_TOKEN_KEY, simulatedToken)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    return true
  }
  return false
}

// Simulate user registration
export const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
  // In a real app, this would be a POST request to your Spring Boot /api/auth/register endpoint
  // const response = await fetch('http://localhost:8080/api/auth/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, email, password }),
  // });
  // return response.ok;

  // Simulate successful registration for any non-empty credentials
  if (username && email && password) {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    console.log(`Simulated registration for: ${username}, ${email}`)
    return true
  }
  return false
}

// Check if a user is authenticated (by checking for a token)
export const checkAuth = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY)
}

// Log out user
export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// Get the stored JWT token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}
