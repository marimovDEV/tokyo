# Restaurant Menu System

A complete restaurant menu management system with Django REST API backend and Next.js frontend.

## Project Structure

```
restaurantmenusystem3-5/
├── backend/                 # Django REST API
│   ├── restaurant_api/     # Django project settings
│   ├── menu/              # Main app with models, views, serializers
│   ├── requirements.txt   # Python dependencies
│   └── README.md         # Backend documentation
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and API client
│   ├── hooks/           # Custom React hooks for API
│   ├── public/          # Static assets
│   └── package.json     # Node.js dependencies
└── README.md            # This file
```

## Features

### Backend (Django REST API)
- **Categories Management**: CRUD operations for food categories
- **Menu Items**: Complete menu item management with multilingual support (English, Uzbek, Russian)
- **Promotions**: Special offers and promotional items
- **Reviews**: Customer review system with admin approval
- **Orders**: Complete order management system
- **Search**: Advanced search functionality
- **Admin Panel**: Django admin interface for content management
- **Dynamic Content Management**: All website texts, logos, and settings can be changed from admin panel
- **Site Settings**: Logo, contact info, social media links, SEO settings
- **Restaurant Info**: All restaurant information and texts in multiple languages
- **Text Content**: Dynamic text content system for flexible content management

### Frontend (Next.js)
- **Multi-language Support**: English, Uzbek, Russian
- **Responsive Design**: Mobile-first approach
- **Menu Display**: Category-based menu browsing
- **Cart System**: Add items to cart with quantity management
- **Order Management**: Place and track orders
- **Review System**: Customer reviews and ratings
- **Admin Interface**: Order management for staff

## Quick Start

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Populate sample data**
   ```bash
   python manage.py populate_data
   ```

8. **Start development server**
   ```bash
   python manage.py runserver
   ```

Backend API will be available at: `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

Frontend will be available at: `http://localhost:3000`

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage:
- **Categories** - Food categories
- **Menu Items** - Restaurant menu items
- **Promotions** - Special offers and deals
- **Reviews** - Customer reviews (approve/reject)
- **Orders** - Restaurant orders
- **Site Settings** - Logo, contact info, social media, SEO
- **Restaurant Information** - All restaurant texts and descriptions
- **Text Content** - Dynamic text content for any part of the website

### Key Admin Features:
- **Logo Management**: Upload and change site logo from admin
- **Text Editing**: Change any text on the website in 3 languages
- **Contact Info**: Update phone, address, working hours
- **Social Media**: Add Facebook, Instagram, Telegram links
- **SEO Settings**: Meta title, description, keywords
- **Maintenance Mode**: Enable/disable site maintenance

## API Endpoints

### Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/{id}/` - Get category details

### Menu Items
- `GET /api/menu-items/` - List all menu items
- `GET /api/menu-items/{id}/` - Get menu item details
- `GET /api/categories/{id}/menu-items/` - Get menu items by category

### Promotions
- `GET /api/promotions/` - List active promotions
- `GET /api/promotions/{id}/` - Get promotion details

### Reviews
- `GET /api/reviews/` - List approved reviews
- `POST /api/reviews/` - Create new review

### Orders
- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/{id}/` - Get order details
- `PATCH /api/orders/{id}/status/` - Update order status

### Search & Stats
- `GET /api/search/?q={query}` - Search menu items
- `GET /api/stats/` - Get menu statistics

### Site Management
- `GET /api/site-settings/` - Get site settings (logo, contact info, etc.)
- `GET /api/restaurant-info/` - Get restaurant information and texts
- `GET /api/text-content/` - Get all text content
- `GET /api/text-content/type/{type}/` - Get text content by type

## Technologies Used

### Backend
- **Django 4.2.7**: Web framework
- **Django REST Framework**: API framework
- **Django CORS Headers**: Cross-origin resource sharing
- **Pillow**: Image processing
- **python-decouple**: Environment variable management
- **django-filter**: Advanced filtering

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **Lucide React**: Icons
- **React Hook Form**: Form handling

## Development

### Backend Development
- Models are defined in `backend/menu/models.py`
- API views in `backend/menu/views.py`
- Serializers in `backend/menu/serializers.py`
- URL routing in `backend/menu/urls.py`

### Frontend Development
- Pages in `frontend/app/`
- Components in `frontend/components/`
- API client in `frontend/lib/api.ts`
- Custom hooks in `frontend/hooks/use-api.ts`

## Production Deployment

### Backend
1. Set `DEBUG=False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS for your domain
5. Use environment variables for sensitive data

### Frontend
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the documentation in each folder
2. Review the API endpoints
3. Check Django and Next.js documentation
4. Create an issue in the repository
