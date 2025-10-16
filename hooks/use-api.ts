import { useCSRF } from './use-csrf';
import { useState, useEffect, useCallback, useMemo } from 'react';

// API client hook - CSRF token bilan avtomatik ishlaydi
export function useApiClient() {
  const { makeAuthenticatedRequest, getCSRFHeaders, isLoading: csrfLoading } = useCSRF();

  const apiClient = useMemo(() => ({
    // GET so'rovlar
    async get<T>(endpoint: string): Promise<T> {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    },

    // POST so'rovlar
    async post<T>(endpoint: string, data: any): Promise<T> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },

    // PUT so'rovlar
    async put<T>(endpoint: string, data: any): Promise<T> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },

    // PATCH so'rovlar
    async patch<T>(endpoint: string, data: any): Promise<T> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },

    // DELETE so'rovlar
    async delete(endpoint: string): Promise<void> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    },

    // FormData bilan so'rovlar (fayl yuklash uchun)
    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'POST',
          body: formData,
          // Content-Type ni qo'lda o'rnatmaymiz - brauzer o'zi multipart/form-data belgilaydi
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },

    // PATCH FormData bilan
    async patchFormData<T>(endpoint: string, formData: FormData): Promise<T> {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${endpoint}`,
        {
          method: 'PATCH',
          body: formData,
          // Content-Type ni qo'lda o'rnatmaymiz - brauzer o'zi multipart/form-data belgilaydi
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    },
  }), [makeAuthenticatedRequest]);

  return {
    ...apiClient,
    isLoading: csrfLoading,
  };
}

// Reviews hook
export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reviews/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Filter only approved and not deleted reviews
        const approvedReviews = (data.results || []).filter(
          (review: any) => review.approved && !review.deleted
        );
        setReviews(approvedReviews);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch only once on mount
    fetchReviews();
  }, []); // Empty dependency to prevent infinite loop

  return { reviews, loading, error };
}

// Restaurant Info hook
export function useRestaurantInfo() {
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        setLoading(true);
        
        // Add cache-busting to always get fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/restaurant-info/?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRestaurantInfo(data || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
    
    // No automatic refresh - data will be fetched on component mount only
  }, []); // Empty dependency array to prevent infinite loop

  return { restaurantInfo, loading, error };
}

// Text Content hook
export function useTextContent(contentType?: string) {
  const [textContent, setTextContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        
        const endpoint = contentType 
          ? `/text-content/type/${contentType}/`
          : '/text-content/';
        
        // Add cache-busting to always get fresh data
        const timestamp = new Date().getTime();
        const cacheBustedEndpoint = endpoint.includes('?') ? `${endpoint}&t=${timestamp}` : `${endpoint}?t=${timestamp}`;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${cacheBustedEndpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTextContent(data.results || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
    
    // No automatic refresh - data will be fetched on component mount only
  }, [contentType]); // Depend on contentType

  return { textContent, loading, error };
}

// Site Settings hook
export function useSiteSettings() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        setLoading(true);
        
        // Add cache-busting to always get fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/site-settings/?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSiteSettings(data || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
    
    // No automatic refresh - data will be fetched on component mount only
  }, []); // Empty dependency array to prevent infinite loop

  return { siteSettings, loading, error };
}

// Categories hook
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use show_all=true to get all categories including inactive ones for admin
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/?show_all=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategories(data.results || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch };
}

// Menu Items hook
export function useMenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMenuItems(data.results || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const refetch = useCallback(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return { menuItems, loading, error, refetch };
}

// Single Menu Item hook
export function useMenuItem(id: string | number) {
  const { get } = useApiClient();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchMenuItem = async () => {
      try {
        setLoading(true);
        const response = await get<any>(`/menu-items/${id}/`);
        setMenuItem(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]); // Only depend on id, not get function

  return { menuItem, loading, error };
}

// Promotions hook
export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPromotions(data.results || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const refetch = useCallback(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return { promotions, loading, error, refetch };
}

// Hook ishlatish misoli:
/*
function AdminComponent() {
  const api = useApiClient();

  const handleCreateItem = async (itemData: any) => {
    try {
      const newItem = await api.post('/menu-items/', itemData);
      console.log('Item created:', newItem);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (id: number, itemData: any) => {
    try {
      const updatedItem = await api.patch(`/menu-items/${id}/`, itemData);
      console.log('Item updated:', updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.delete(`/menu-items/${id}/`);
      console.log('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div>
      {api.isLoading && <p>Loading...</p>}
      <button onClick={() => handleCreateItem({ name: 'Test Item' })}>
        Create Item
      </button>
    </div>
  );
}
*/