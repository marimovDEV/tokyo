"use client";
import { useState } from "react";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Upload, X } from "lucide-react";

interface UploadFormProps {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  uploadType: 'category' | 'menuItem' | 'promotion';
  language?: 'uz' | 'ru' | 'en';
}

export default function UploadForm({ 
  onSuccess, 
  onError, 
  uploadType,
  language = 'uz' 
}: UploadFormProps) {
  const { 
    uploadCategory, 
    uploadMenuItem, 
    uploadPromotion,
    isLoading, 
    error 
  } = useUpload();

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_uz: '',
    name_ru: '',
    description: '',
    description_uz: '',
    description_ru: '',
    price: '',
    category: '',
    active: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file && uploadType !== 'category') {
      onError?.(new Error('File is required'));
      return;
    }

    try {
      let result;
      
      switch (uploadType) {
        case 'category':
          result = await uploadCategory({
            name: formData.name,
            name_uz: formData.name_uz,
            name_ru: formData.name_ru,
          }, file || undefined);
          break;
          
        case 'menuItem':
          result = await uploadMenuItem({
            name: formData.name,
            name_uz: formData.name_uz,
            name_ru: formData.name_ru,
            description: formData.description,
            description_uz: formData.description_uz,
            description_ru: formData.description_ru,
            price: parseFloat(formData.price) || 0,
            category: parseInt(formData.category) || 1,
          }, file || undefined);
          break;
          
        case 'promotion':
          result = await uploadPromotion({
            title: formData.name,
            title_uz: formData.name_uz,
            title_ru: formData.name_ru,
            description: formData.description,
            description_uz: formData.description_uz,
            description_ru: formData.description_ru,
            active: formData.active,
            category: parseInt(formData.category) || 1,
          }, file || undefined);
          break;
      }
      
      onSuccess?.(result);
      
      // Reset form
      setFile(null);
      setFormData({
        name: '',
        name_uz: '',
        name_ru: '',
        description: '',
        description_uz: '',
        description_ru: '',
        price: '',
        category: '',
        active: true,
      });
      
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const getLabels = () => {
    const labels = {
      uz: {
        title: uploadType === 'category' ? 'Kategoriya qo\'shish' : 
               uploadType === 'menuItem' ? 'Taom qo\'shish' : 'Aksiya qo\'shish',
        name: 'Nomi',
        nameUz: 'O\'zbek tilida',
        nameRu: 'Rus tilida',
        description: 'Tavsif',
        price: 'Narxi',
        category: 'Kategoriya',
        file: 'Rasm',
        submit: 'Yuborish',
        uploading: 'Yuklanmoqda...',
      },
      ru: {
        title: uploadType === 'category' ? 'Добавить категорию' : 
               uploadType === 'menuItem' ? 'Добавить блюдо' : 'Добавить акцию',
        name: 'Название',
        nameUz: 'На узбекском',
        nameRu: 'На русском',
        description: 'Описание',
        price: 'Цена',
        category: 'Категория',
        file: 'Изображение',
        submit: 'Отправить',
        uploading: 'Загружается...',
      },
      en: {
        title: uploadType === 'category' ? 'Add Category' : 
               uploadType === 'menuItem' ? 'Add Menu Item' : 'Add Promotion',
        name: 'Name',
        nameUz: 'In Uzbek',
        nameRu: 'In Russian',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        file: 'Image',
        submit: 'Submit',
        uploading: 'Uploading...',
      }
    };
    return labels[language];
  };

  const labels = getLabels();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{labels.title}</h3>
      
      {/* File Upload */}
      <div>
        <Label htmlFor="file">{labels.file}</Label>
        <div className="flex items-center gap-4 mt-2">
          {file && (
            <div className="flex items-center gap-2 bg-muted p-2 rounded">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="name">{labels.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={labels.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="name_uz">{labels.nameUz}</Label>
          <Input
            id="name_uz"
            value={formData.name_uz}
            onChange={(e) => handleInputChange('name_uz', e.target.value)}
            placeholder={labels.nameUz}
            required
          />
        </div>
        <div>
          <Label htmlFor="name_ru">{labels.nameRu}</Label>
          <Input
            id="name_ru"
            value={formData.name_ru}
            onChange={(e) => handleInputChange('name_ru', e.target.value)}
            placeholder={labels.nameRu}
            required
          />
        </div>
      </div>

      {/* Description Fields */}
      {(uploadType === 'menuItem' || uploadType === 'promotion') && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="description">{labels.description}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={labels.description}
            />
          </div>
          <div>
            <Label htmlFor="description_uz">{labels.description} (UZ)</Label>
            <Input
              id="description_uz"
              value={formData.description_uz}
              onChange={(e) => handleInputChange('description_uz', e.target.value)}
              placeholder={labels.description}
            />
          </div>
          <div>
            <Label htmlFor="description_ru">{labels.description} (RU)</Label>
            <Input
              id="description_ru"
              value={formData.description_ru}
              onChange={(e) => handleInputChange('description_ru', e.target.value)}
              placeholder={labels.description}
            />
          </div>
        </div>
      )}

      {/* Price Field for Menu Items */}
      {uploadType === 'menuItem' && (
        <div>
          <Label htmlFor="price">{labels.price}</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="100"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="50000"
          />
        </div>
      )}

      {/* Category Field */}
      <div>
        <Label htmlFor="category">{labels.category}</Label>
        <Input
          id="category"
          type="number"
          min="1"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          placeholder="1"
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            {labels.uploading}
          </>
        ) : (
          labels.submit
        )}
      </Button>
    </form>
  );
}
