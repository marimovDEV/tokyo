// CSRF Hook-larini ishlatish misollari

import React from 'react';
import { useCSRF } from '@/hooks/use-csrf';
import { useApiClient } from '@/hooks/use-api';
import { useAdminApi } from '@/app/admin/use-admin-api';

// 1. Oddiy CSRF hook ishlatish
function SimpleCSRFExample() {
  const { makeAuthenticatedRequest, isLoading } = useCSRF();

  const handleSubmit = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        'http://localhost:8000/api/menu-items/',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Item',
            name_uz: 'Test Taom',
            name_ru: 'Тест Блюдо',
            price: 25000,
            category: 1,
          }),
        }
      );
      
      if (response.ok) {
        console.log('Success!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading CSRF token...</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

// 2. API Client hook ishlatish
function ApiClientExample() {
  const api = useApiClient();

  const handleCreateItem = async () => {
    try {
      const newItem = await api.post('/menu-items/', {
        name: 'Test Item',
        name_uz: 'Test Taom',
        name_ru: 'Тест Блюдо',
        price: 25000,
        category: 1,
      });
      console.log('Item created:', newItem);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async () => {
    try {
      const updatedItem = await api.patch('/menu-items/1/', {
        name: 'Updated Item',
        price: 30000,
      });
      console.log('Item updated:', updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await api.delete('/menu-items/1/');
      console.log('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div>
      {api.isLoading && <p>Loading...</p>}
      <button onClick={handleCreateItem}>Create Item</button>
      <button onClick={handleUpdateItem}>Update Item</button>
      <button onClick={handleDeleteItem}>Delete Item</button>
    </div>
  );
}

// 3. Admin API hook ishlatish
function AdminApiExample() {
  const adminApi = useAdminApi();

  const handleCreateCategory = async () => {
    try {
      const newCategory = await adminApi.createCategory({
        name: 'Test Category',
        name_uz: 'Test Kategoriya',
        name_ru: 'Тест Категория',
        icon: '🧪',
      });
      console.log('Category created:', newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateMenuItem = async () => {
    try {
      const newItem = await adminApi.createMenuItem({
        name: 'Test Menu Item',
        name_uz: 'Test Taom',
        name_ru: 'Тест Блюдо',
        description: 'Test description',
        description_uz: 'Test tavsif',
        description_ru: 'Тест описание',
        price: 25000,
        category: 1,
        available: true,
        ingredients: ['ingredient1', 'ingredient2'],
        ingredients_uz: ['ingredient1_uz', 'ingredient2_uz'],
        ingredients_ru: ['ingredient1_ru', 'ingredient2_ru'],
      });
      console.log('Menu item created:', newItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
    }
  };

  const handleCreatePromotion = async () => {
    try {
      const newPromotion = await adminApi.createPromotion({
        title: 'Test Promotion',
        title_uz: 'Test Aksiya',
        title_ru: 'Тест Акция',
        description: 'Test promotion description',
        description_uz: 'Test aksiya tavsifi',
        description_ru: 'Тест описание акции',
        active: true,
        category: 1,
      });
      console.log('Promotion created:', newPromotion);
    } catch (error) {
      console.error('Error creating promotion:', error);
    }
  };

  return (
    <div>
      {adminApi.isLoading && <p>Loading...</p>}
      <button onClick={handleCreateCategory}>Create Category</button>
      <button onClick={handleCreateMenuItem}>Create Menu Item</button>
      <button onClick={handleCreatePromotion}>Create Promotion</button>
    </div>
  );
}

// 4. FormData bilan fayl yuklash
function FileUploadExample() {
  const api = useApiClient();

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('name', 'Test Item with Image');
      formData.append('name_uz', 'Test Taom Rasm bilan');
      formData.append('name_ru', 'Тест Блюдо с изображением');
      formData.append('price', '25000');
      formData.append('category', '1');
      formData.append('image_file', file);

      const newItem = await api.postFormData('/menu-items/', formData);
      console.log('Item with image created:', newItem);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />
    </div>
  );
}

// 5. Error handling bilan
function ErrorHandlingExample() {
  const api = useApiClient();

  const handleWithErrorHandling = async () => {
    try {
      const result = await api.post('/menu-items/', {
        name: 'Test Item',
        // Deliberately missing required fields to trigger error
      });
      console.log('Success:', result);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        // Handle specific error types
        if (error.message.includes('400')) {
          console.log('Bad request - check your data');
        } else if (error.message.includes('403')) {
          console.log('Forbidden - CSRF token issue');
        } else if (error.message.includes('500')) {
          console.log('Server error');
        }
      }
    }
  };

  return (
    <div>
      <button onClick={handleWithErrorHandling}>Test Error Handling</button>
    </div>
  );
}

export {
  SimpleCSRFExample,
  ApiClientExample,
  AdminApiExample,
  FileUploadExample,
  ErrorHandlingExample,
};
