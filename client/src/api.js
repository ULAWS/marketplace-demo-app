export const requestWithToken = async (url, options = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If token exists, add it to the headers
  if (token) {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers.Authorization = `Bearer ${token}`;
  }

  // Make the HTTP request
  const response = await fetch(url, options);

  // Check if response is successful
  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  // Return response
  return response.json();
};
