"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UtensilsCrossed, Clock, MapPin, Phone, Star, Instagram } from "lucide-react"
import { useState, useEffect } from "react"
import { useReviews, useRestaurantInfo, useSiteSettings, useTextContent } from "@/hooks/use-api"
import { apiClient, getImageUrl } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/components/ui/toast"

export default function HomePage() {
  const { language, setLanguage } = useLanguage()
  const { addToast } = useToast()
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  
  // Use API hooks for dynamic content
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews()
  const { restaurantInfo, loading: restaurantInfoLoading, error: restaurantInfoError } = useRestaurantInfo()
  const { siteSettings, loading: siteSettingsLoading, error: siteSettingsError } = useSiteSettings()
  
  const { textContent, loading: textContentLoading, error: textContentError } = useTextContent('homepage')
  
  // Smart refresh - only refresh reviews every 5 minutes, not every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Faqat sharhlarni yangilaymiz, sahifani emas
      window.dispatchEvent(new CustomEvent('refreshReviews'))
    }, 300000) // 5 daqiqa - juda kam, faqat kerak bo'lganda
    
    // Cleanup function to clear interval on component unmount
    return () => clearInterval(refreshInterval)
  }, [])
  
          // Debug text content (removed to prevent console spam)
          // console.log('[DEBUG] Text Content State:', {
          //   loading: textContentLoading,
          //   error: textContentError,
          //   content: textContent,
          //   contentLength: textContent?.length
          // });

          // Debug restaurant info (removed to prevent console spam)
          // console.log('[DEBUG] Restaurant Info State:', {
          //   loading: restaurantInfoLoading,
          //   error: restaurantInfoError,
          //   restaurantInfo: restaurantInfo,
          //   heroImage: restaurantInfo?.hero_image,
          //   aboutImage: restaurantInfo?.about_image
          // });

          // Debug site settings (removed to prevent console spam)
          // console.log('[DEBUG] Site Settings State:', {
          //   loading: siteSettingsLoading,
          //   error: siteSettingsError,
          //   siteSettings: siteSettings,
          //   phone: siteSettings?.phone,
          //   email: siteSettings?.email,
          //   address: siteSettings?.address
          // });

  const handleSubmitReview = async () => {
    if (!name.trim() || !surname.trim() || !comment.trim() || rating === 0) {
      addToast({
        type: "warning",
        title: getContent('fields_not_filled', 'Fields not filled'),
        description: getContent('fill_all_fields', 'Please fill all fields and add stars!'),
      })
      return
    }

    try {
      setSubmitting(true)
      await apiClient.createReview({
        name: name.trim(),
        surname: surname.trim(),
        comment: comment.trim(),
        rating,
      })

      // Reset form
      setName("")
      setSurname("")
      setComment("")
      setRating(0)

      // Show success notification
      addToast({
        type: "success",
        title: getContent('review_submitted', 'Review submitted'),
        description: getContent('thank_you_review', 'Thank you for your review! It will be shown after admin approval.'),
      })
    } catch (error) {
      console.error('Error submitting review:', error)
      addToast({
        type: "error",
        title: getContent('error_occurred', 'Error occurred'),
        description: getContent('error_submit_review', 'An error occurred. Please try again.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Get dynamic content from API
  const getContent = (key: string, fallback: string = '', field: string = 'title') => {
    if (textContentLoading || !textContent) {
      return fallback;
    }
    
    const content = textContent.find(item => item.key === key);
    if (!content) {
      return fallback;
    }
    
    const fieldName = `${field}${language === 'uz' ? '_uz' : language === 'ru' ? '_ru' : ''}`;
    const result = content[fieldName] || content[field] || fallback;
    return result;
  };

  const getSiteContent = (field: string, fallback: string = '') => {
    if (siteSettingsLoading || !siteSettings) return fallback;
    
    const fieldName = `${field}_${language}` as keyof typeof siteSettings;
    return siteSettings[fieldName] || fallback;
  };

  const translations = {
    uz: {
      title: getContent('hero_title', "Tokyo"),
      subtitle: getContent('hero_subtitle', "O'zbek milliy oshxonasining eng mazali taomlarini tatib ko'ring"),
      viewMenu: getContent('view_menu_button', "Menyuni Ko'rish"),
      workTime: getContent('work_time', 'Ish Vaqti'),
      workHours: getSiteContent('working_hours', "Har kuni: 09:00 - 23:00"),
      address: getContent('address', 'Manzil'),
      addressText: getSiteContent('address', "Toshkent sh., Amir Temur ko'chasi 15"),
      phone: getContent('phone', 'Telefon'),
      instagram: getContent('instagram', 'Instagram'),
      aboutTitle: getContent('about_title', "Restoran Haqida"),
      aboutText1: getContent('about_description_1', "Bizning restoranimiz 2010-yildan beri O'zbekistonning eng mazali milliy taomlarini tayyorlash bilan shug'ullanadi. Har bir taom an'anaviy retseptlar asosida tayyorlanadi va eng sifatli mahsulotlardan foydalaniladi."),
      aboutText2: getContent('about_description_2', "Biz sizga qulay muhit, tez xizmat va unutilmas ta'mlarni taqdim etamiz. Oilaviy ziyofatlar, do'stlar bilan uchrashuvlar yoki ishbilarmonlik uchrashuvlari uchun ideal joy!"),
      goToMenu: getContent('go_to_menu_button', "Menyuga O'tish →"),
      reviewsTitle: getContent('reviews_title', "Izohlar"),
      leaveReview: getContent('leave_review_title', "Izoh Qoldirish"),
      firstName: getContent('first_name_label', "Ism"),
      lastName: getContent('last_name_label', "Familiya"),
      yourComment: getContent('comment_label', "Sizning izohingiz"),
      rateUs: getContent('rate_us_label', "Bizni baholang"),
      submit: getContent('submit_button', "Yuborish"),
      noReviews: getContent('no_reviews_text', "Hozircha izohlar yo'q. Birinchi bo'lib izoh qoldiring!"),
    },
    ru: {
      title: getContent('hero_title', "Tokyo"),
      subtitle: getContent('hero_subtitle', "Попробуйте самые вкусные блюда узбекской национальной кухни"),
      viewMenu: getContent('view_menu_button', "Посмотреть Меню"),
      workTime: getContent('work_time', 'Время Работы'),
      workHours: getSiteContent('working_hours', "Ежедневно: 09:00 - 23:00"),
      address: getContent('address', 'Адрес'),
      addressText: getSiteContent('address', "г. Ташкент, ул. Амира Темура 15"),
      phone: getContent('phone', 'Телефон'),
      instagram: getContent('instagram', 'Инстаграм'),
      aboutTitle: getContent('about_title', "О Ресторане"),
      aboutText1: getContent('about_description_1', "Наш ресторан с 2010 года занимается приготовлением самых вкусных национальных блюд Узбекистана. Каждое блюдо готовится по традиционным рецептам с использованием самых качественных продуктов."),
      aboutText2: getContent('about_description_2', "Мы предлагаем вам комфортную атмосферу, быстрое обслуживание и незабываемые вкусы. Идеальное место для семейных торжеств, встреч с друзьями или деловых встреч!"),
      goToMenu: getContent('go_to_menu_button', "Перейти в Меню →"),
      reviewsTitle: getContent('reviews_title', "Отзывы"),
      leaveReview: getContent('leave_review_title', "Оставить Отзыв"),
      firstName: getContent('first_name_label', "Имя"),
      lastName: getContent('last_name_label', "Фамилия"),
      yourComment: getContent('comment_label', "Ваш отзыв"),
      rateUs: getContent('rate_us_label', "Оцените нас"),
      submit: getContent('submit_button', "Отправить"),
      noReviews: getContent('no_reviews_text', "Пока нет отзывов. Будьте первым!"),
    },
    en: {
      title: getContent('hero_title', "Tokyo"),
      subtitle: getContent('hero_subtitle', "Taste the most delicious dishes of Uzbek national cuisine"),
      viewMenu: getContent('view_menu_button', "View Menu"),
      workTime: getContent('work_time', 'Working Hours'),
      workHours: getSiteContent('working_hours', "Daily: 09:00 - 23:00"),
      address: getContent('address', 'Address'),
      addressText: getSiteContent('address', "Tashkent, Amir Temur Street 15"),
      phone: getContent('phone', 'Phone'),
      instagram: getContent('instagram', 'Instagram'),
      aboutTitle: getContent('about_title', "About Restaurant"),
      aboutText1: getContent('about_description_1', "Our restaurant has been preparing the most delicious national dishes of Uzbekistan since 2010. Each dish is prepared according to traditional recipes using the highest quality products."),
      aboutText2: getContent('about_description_2', "We offer you a comfortable atmosphere, fast service and unforgettable tastes. The perfect place for family celebrations, meetings with friends or business meetings!"),
      goToMenu: getContent('go_to_menu_button', "Go to Menu →"),
      reviewsTitle: getContent('reviews_title', "Reviews"),
      leaveReview: getContent('leave_review_title', "Leave a Review"),
      firstName: getContent('first_name_label', "First Name"),
      lastName: getContent('last_name_label', "Last Name"),
      yourComment: getContent('comment_label', "Your comment"),
      rateUs: getContent('rate_us_label', "Rate us"),
      submit: getContent('submit_button', "Submit"),
      noReviews: getContent('no_reviews_text', "No reviews yet. Be the first!"),
    },
  }

  const t = translations[language]

  const goToMenu = () => {
    // Language is already saved in LanguageContext
    window.location.href = "/menu"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Language Toggle */}
      <div className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 md:flex md:justify-end md:gap-2">
          <Button
            variant={language === "uz" ? "default" : "outline"}
            onClick={() => setLanguage("uz")}
            className={`w-full md:w-auto ${language === "uz" ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            O'zbekcha
          </Button>
          <Button
            variant={language === "ru" ? "default" : "outline"}
            onClick={() => setLanguage("ru")}
            className={`w-full md:w-auto ${language === "ru" ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            Русский
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            onClick={() => setLanguage("en")}
            className={`w-full md:w-auto ${language === "en" ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            English
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-64 h-64 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-2xl">
            <img
              src={restaurantInfo?.hero_image ? getImageUrl(restaurantInfo.hero_image) : getImageUrl("/logo.png")}
              alt={getSiteContent('site_name', "Tokyo Restaurant")}
              className="w-64 h-64 object-contain rounded-full"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-green-800 mb-8 font-medium">{t.subtitle}</p>
          <Button
            size="lg"
            onClick={goToMenu}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
          >
            {t.viewMenu}
          </Button>
        </div>

        {/* Restaurant Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-3 md:p-8 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-200">
            <div className="flex items-center justify-center w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-2 md:mb-4 mx-auto">
              <Clock className="w-4 h-4 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xs md:text-xl font-bold text-green-800 mb-1 md:mb-2 text-center">{t.workTime}</h3>
            <p className="text-[10px] md:text-base text-green-700 text-center font-medium">
              {siteSettingsLoading ? getContent('loading_text', 'Loading...') : (siteSettings?.working_hours || "Har kuni: 09:00 - 23:00")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 md:p-8 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-200">
            <div className="flex items-center justify-center w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-2 md:mb-4 mx-auto">
              <MapPin className="w-4 h-4 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xs md:text-xl font-bold text-green-800 mb-1 md:mb-2 text-center">{t.address}</h3>
            <p className="text-[10px] md:text-base text-green-700 text-center font-medium">
              {siteSettingsLoading ? (
                getContent('loading_text', 'Loading...')
              ) : (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings?.address || "Toshkent sh., Amir Temur ko'chasi 15")}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors duration-200 cursor-pointer"
                >
                  {siteSettings?.address || "Toshkent sh., Amir Temur ko'chasi 15"}
                </a>
              )}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 md:p-8 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-200">
            <div className="flex items-center justify-center w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-2 md:mb-4 mx-auto">
              <Phone className="w-4 h-4 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xs md:text-xl font-bold text-green-800 mb-1 md:mb-2 text-center">{t.phone}</h3>
            <p className="text-[10px] md:text-base text-green-700 text-center font-medium">
              {siteSettingsLoading ? getContent('loading_text', 'Loading...') : (siteSettings?.phone || "+998 90 123 45 67")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 md:p-8 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-200">
            <div className="flex items-center justify-center w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-2 md:mb-4 mx-auto">
              <Instagram className="w-4 h-4 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xs md:text-xl font-bold text-green-800 mb-1 md:mb-2 text-center">{t.instagram}</h3>
            <p className="text-[10px] md:text-base text-green-700 text-center font-medium">
              {siteSettingsLoading ? (
                getContent('loading_text', 'Loading...')
              ) : siteSettings?.instagram_url ? (
                <a 
                  href={siteSettings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors duration-200"
                >
                  @{siteSettings.instagram_url.split('/').filter(Boolean).pop()?.split('?')[0] || 'tokyorestaurant'}
                </a>
              ) : (
                "@tokyorestaurant"
              )}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border-2 border-green-200 mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t.aboutTitle}
          </h2>
          
          {/* About Image */}
          {restaurantInfo?.about_image && (
            <div className="flex justify-center mb-8">
              <img
                src={getImageUrl(restaurantInfo.about_image)}
                alt={t.aboutTitle}
                className="max-w-full max-h-96 w-auto h-auto object-contain rounded-2xl shadow-lg"
                style={{ aspectRatio: 'auto' }}
              />
            </div>
          )}
          
          <div className="space-y-6 text-green-800 text-lg leading-relaxed">
            <p className="text-center font-medium">{t.aboutText1}</p>
            <p className="text-center font-medium">{t.aboutText2}</p>
          </div>

          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={goToMenu}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 text-lg font-bold rounded-full shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
            >
              {t.goToMenu}
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t.reviewsTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Leave Review Form */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6">{t.leaveReview}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-green-800 font-medium mb-2">{t.firstName}</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.firstName}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-green-800 font-medium mb-2">{t.lastName}</label>
                  <Input
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder={t.lastName}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-green-800 font-medium mb-2">{t.yourComment}</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.yourComment}
                    rows={4}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-green-800 font-medium mb-2">{t.rateUs}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? (language === "uz" ? "Yuborilmoqda..." : language === "ru" ? "Отправляется..." : "Submitting...") : t.submit}
                </Button>
              </div>
            </div>

            {/* Display Reviews */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-green-200 max-h-[600px] overflow-y-auto">
              {reviewsLoading ? (
                <p className="text-center text-green-700 text-lg py-12">
                  {language === "uz" ? "Izohlar yuklanmoqda..." : language === "ru" ? "Загрузка отзывов..." : "Loading reviews..."}
                </p>
              ) : reviewsError ? (
                <p className="text-center text-red-600 text-lg py-12">
                  {language === "uz" ? "Izohlarni yuklashda xatolik" : language === "ru" ? "Ошибка загрузки отзывов" : "Error loading reviews"}
                </p>
              ) : !reviews || reviews.length === 0 ? (
                <p className="text-center text-green-700 text-lg py-12">{t.noReviews}</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-green-50 p-6 rounded-2xl border border-green-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-green-900 text-lg">
                            {review.name} {review.surname}
                          </h4>
                          <p className="text-sm text-green-600">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-green-800 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
