import { API_BASE_URL } from "../config/api";

/**
 * HTTP Client with automatic auth header injection
 * Handles:
 * - Authorization header injection
 * - Request/response logging
 * - Error normalization
 * - 401 Unauthorized redirect to login
 */

class HTTPClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get authorization token from localStorage
   * Tries student token first, then admin token
   */
  getAuthToken() {
    return localStorage.getItem("ppdb_token") || localStorage.getItem("ppdb_admin_token");
  }

  /**
   * Build headers with authorization if available
   */
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Handle response errors consistently
   */
  async handleError(response) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }

    // Log errors
    console.error(`❌ API Error (${response.status}):`, errorData);

    // 401 Unauthorized - clear tokens and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("ppdb_token");
      localStorage.removeItem("ppdb_siswa");
      localStorage.removeItem("ppdb_admin_token");
      localStorage.removeItem("ppdb_admin");
      window.location.href = "/";
    }

    throw {
      status: response.status,
      ...errorData,
    };
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.buildHeaders(options.headers),
      ...options,
    });

    if (!response.ok) {
      return this.handleError(response);
    }

    return response.json();
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(options.headers),
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      return this.handleError(response);
    }

    return response.json();
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.buildHeaders(options.headers),
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      return this.handleError(response);
    }

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.buildHeaders(options.headers),
      ...options,
    });

    if (!response.ok) {
      return this.handleError(response);
    }

    return response.json();
  }

  /**
   * POST with FormData (for file uploads)
   */
  async postFormData(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      ...options,
    });

    if (!response.ok) {
      return this.handleError(response);
    }

    return response.json();
  }
}

// Create singleton instance
export const apiClient = new HTTPClient();

export default apiClient;
