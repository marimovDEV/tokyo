"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal, Plus, Search, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuItem {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  price: number;
  category: {
    id: number;
    name: string;
    name_uz: string;
    name_ru: string;
  };
  available: boolean;
  is_active: boolean;
  image: string;
  rating: number;
  prep_time: number;
  ingredients: string;
  ingredients_uz: string;
  ingredients_ru: string;
}

interface Category {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  icon: string;
  image: string;
  is_active: boolean;
}

interface Promotion {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
  description: string;
  description_uz: string;
  description_ru: string;
  image: string;
  active: boolean;
  is_active: boolean;
  category: number;
  linked_dish: number;
}

const MenuItemAdminCard: React.FC<{
  item: MenuItem;
  onToggleActive: (id: number, isActive: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}> = ({ item, onToggleActive, onEdit, onDelete }) => {
  const { language } = useLanguage();

  const getName = () => {
    switch (language) {
      case 'uz': return item.name_uz;
      case 'ru': return item.name_ru;
      default: return item.name;
    }
  };

  const getIngredients = () => {
    switch (language) {
      case 'uz': return item.ingredients_uz;
      case 'ru': return item.ingredients_ru;
      default: return item.ingredients;
    }
  };

  const getCategoryName = () => {
    switch (language) {
      case 'uz': return item.category.name_uz;
      case 'ru': return item.category.name_ru;
      default: return item.category.name;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!item.is_active ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.image ? (
                <img 
                  src={`http://localhost:8000${item.image}`} 
                  alt={getName()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{getName()}</h3>
                  <p className="text-sm text-gray-600 mb-1">{getCategoryName()}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{getIngredients()}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={item.available ? "default" : "secondary"} className="text-xs">
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                  <Badge variant={item.is_active ? "default" : "destructive"} className="text-xs">
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-semibold text-green-600">${item.price}</span>
                  <span>⭐ {item.rating}</span>
                  <span>⏱️ {item.prep_time}min</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Active:</span>
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => onToggleActive(item.id, checked)}
                      size="sm"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CategoryAdminCard: React.FC<{
  category: Category;
  onToggleActive: (id: number, isActive: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}> = ({ category, onToggleActive, onEdit, onDelete }) => {
  const { language } = useLanguage();

  const getName = () => {
    switch (language) {
      case 'uz': return category.name_uz;
      case 'ru': return category.name_ru;
      default: return category.name;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!category.is_active ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {category.image ? (
                <img 
                  src={`http://localhost:8000${category.image}`} 
                  alt={getName()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{category.icon}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{getName()}</h3>
              <Badge variant={category.is_active ? "default" : "destructive"} className="text-xs mt-1">
                {category.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Active:</span>
              <Switch
                checked={category.is_active}
                onCheckedChange={(checked) => onToggleActive(category.id, checked)}
                size="sm"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(category.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PromotionAdminCard: React.FC<{
  promotion: Promotion;
  onToggleActive: (id: number, isActive: boolean) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => void;
}> = ({ promotion, onToggleActive, onEdit, onDelete }) => {
  const { language } = useLanguage();

  const getTitle = () => {
    switch (language) {
      case 'uz': return promotion.title_uz;
      case 'ru': return promotion.title_ru;
      default: return promotion.title;
    }
  };

  const getDescription = () => {
    switch (language) {
      case 'uz': return promotion.description_uz;
      case 'ru': return promotion.description_ru;
      default: return promotion.description;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!promotion.is_active ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {promotion.image ? (
                <img 
                  src={`http://localhost:8000${promotion.image}`} 
                  alt={getTitle()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{getTitle()}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{getDescription()}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={promotion.active ? "default" : "secondary"} className="text-xs">
                    {promotion.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={promotion.is_active ? "default" : "destructive"} className="text-xs">
                    {promotion.is_active ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-600">
                  Category ID: {promotion.category} | Dish ID: {promotion.linked_dish}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Active:</span>
                    <Switch
                      checked={promotion.is_active}
                      onCheckedChange={(checked) => onToggleActive(promotion.id, checked)}
                      size="sm"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(promotion)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(promotion.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminMenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { language, setLanguage } = useLanguage();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data including inactive items for admin
      const [menuResponse, categoriesResponse, promotionsResponse] = await Promise.all([
        fetch("http://localhost:8000/api/menu-items/"),
        fetch("http://localhost:8000/api/categories/"),
        fetch("http://localhost:8000/api/promotions/")
      ]);

      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      if (promotionsResponse.ok) {
        const promotionsData = await promotionsResponse.json();
        setPromotions(promotionsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (type: 'menu' | 'category' | 'promotion', id: number, isActive: boolean) => {
    try {
      let endpoint = '';
      let data = {};
      
      switch (type) {
        case 'menu':
          endpoint = `http://localhost:8000/api/menu-items/${id}/`;
          data = { is_active: isActive };
          break;
        case 'category':
          endpoint = `http://localhost:8000/api/categories/${id}/`;
          data = { is_active: isActive };
          break;
        case 'promotion':
          endpoint = `http://localhost:8000/api/promotions/${id}/`;
          data = { is_active: isActive };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Update local state
        switch (type) {
          case 'menu':
            setMenuItems(prev => prev.map(item => 
              item.id === id ? { ...item, is_active: isActive } : item
            ));
            break;
          case 'category':
            setCategories(prev => prev.map(cat => 
              cat.id === id ? { ...cat, is_active: isActive } : cat
            ));
            break;
          case 'promotion':
            setPromotions(prev => prev.map(promo => 
              promo.id === id ? { ...promo, is_active: isActive } : promo
            ));
            break;
        }
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleEdit = (item: any, type: string) => {
    // For now, just log - you can implement edit functionality later
    console.log(`Edit ${type}:`, item);
    alert(`Edit functionality for ${type} will be implemented later.`);
  };

  const handleDelete = async (id: number, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      let endpoint = '';
      
      switch (type) {
        case 'menu':
          endpoint = `http://localhost:8000/api/menu-items/${id}/`;
          break;
        case 'category':
          endpoint = `http://localhost:8000/api/categories/${id}/`;
          break;
        case 'promotion':
          endpoint = `http://localhost:8000/api/promotions/${id}/`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        switch (type) {
          case 'menu':
            setMenuItems(prev => prev.filter(item => item.id !== id));
            break;
          case 'category':
            setCategories(prev => prev.filter(cat => cat.id !== id));
            break;
          case 'promotion':
            setPromotions(prev => prev.filter(promo => promo.id !== id));
            break;
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name_ru.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name_ru.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPromotions = promotions.filter(promo => 
    promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.title_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.title_ru.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              <Badge variant="outline" className="text-xs">
                Menu Management
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Globe className="mr-2 h-4 w-4" />
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('uz')}>
                    O'zbekcha
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ru')}>
                    Русский
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchData} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="menu-items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu-items">
              Menu Items ({filteredMenuItems.length})
            </TabsTrigger>
            <TabsTrigger value="categories">
              Categories ({filteredCategories.length})
            </TabsTrigger>
            <TabsTrigger value="promotions">
              Promotions ({filteredPromotions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu-items" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu Items</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredMenuItems.map((item) => (
                <MenuItemAdminCard
                  key={item.id}
                  item={item}
                  onToggleActive={(id, isActive) => handleToggleActive('menu', id, isActive)}
                  onEdit={(item) => handleEdit(item, 'menu item')}
                  onDelete={(id) => handleDelete(id, 'menu item')}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Categories</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredCategories.map((category) => (
                <CategoryAdminCard
                  key={category.id}
                  category={category}
                  onToggleActive={(id, isActive) => handleToggleActive('category', id, isActive)}
                  onEdit={(category) => handleEdit(category, 'category')}
                  onDelete={(id) => handleDelete(id, 'category')}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Promotions</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Promotion
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredPromotions.map((promotion) => (
                <PromotionAdminCard
                  key={promotion.id}
                  promotion={promotion}
                  onToggleActive={(id, isActive) => handleToggleActive('promotion', id, isActive)}
                  onEdit={(promotion) => handleEdit(promotion, 'promotion')}
                  onDelete={(id) => handleDelete(id, 'promotion')}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMenuPage;
