import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Menu, X, Star, MapPin, Phone, Clock, CheckCircle, ArrowRight, Facebook, Instagram, Twitter, Mail, Shield, Award, Zap, Heart } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-red-700 mb-4">
              Maaf, terjadi masalah teknis. Silakan refresh halaman atau coba beberapa saat lagi.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Refresh Halaman
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full border border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom Hooks
const useFormValidation = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [values, validate]);

  const handleSubmit = useCallback((callback) => (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      callback(values);
    }
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// Sub Components
const SEOHead = () => {
  useEffect(() => {
    // Enhanced SEO meta tags
    const metaTags = [
      { name: 'description', content: 'Sewa motor modern dengan harga terjangkau. Proses booking mudah, motor terawat, dan layanan 24/7. Pilihan terbaik untuk perjalanan Anda.' },
      { name: 'keywords', content: 'sewa motor, rental motor, motor bali, sewa motor murah, rental motor online' },
      { property: 'og:title', content: 'MotorRent - Sewa Motor Modern Terbaik di Indonesia' },
      { property: 'og:description', content: 'Sewa motor modern dengan harga terjangkau. Proses booking mudah, motor terawat, dan layanan 24/7.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (tag.name) element.name = tag.name;
        if (tag.property) element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.content = tag.content;
    });
  }, []);

  return null;
};

const LoadingSpinner = ({ size = 'large' }) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg animate-fade-in ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : notification.type === 'warning'
              ? 'bg-yellow-500 text-black'
              : 'bg-green-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="mr-2" size={20} />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => onRemove(notification.id)}
              className="ml-4 hover:opacity-70 transition-opacity"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InstallPrompt = ({ show, onInstall, onDismiss }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-2xl z-50 md:left-auto md:max-w-sm animate-scale-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <Award className="mr-3 mt-1 flex-shrink-0" size={24} />
          <div className="flex-1">
            <p className="font-semibold text-lg">Install MotorRent</p>
            <p className="text-blue-100 text-sm mt-1">Akses lebih cepat dari homescreen</p>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={onDismiss}
            className="px-3 py-1 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
          >
            Nanti
          </button>
          <button 
            onClick={onInstall}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

// Data layers
const useMotorcycleData = () => {
  return useMemo(() => [
    {
      id: 1,
      name: "Honda CB150R",
      price: 120000,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      specs: ["150cc", "Manual", "ABS", "180kg"],
      rating: 4.9,
      reviews: 128,
      featured: true,
      category: "sport"
    },
    {
      id: 2,
      name: "Yamaha NMAX",
      price: 100000,
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
      specs: ["155cc", "Automatic", "ABS", "131kg"],
      rating: 4.8,
      reviews: 95,
      featured: false,
      category: "matic"
    },
    {
      id: 3,
      name: "Suzuki GSX-R150",
      price: 130000,
      image: "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=400&h=300&fit=crop",
      specs: ["150cc", "Manual", "ABS", "142kg"],
      rating: 4.7,
      reviews: 87,
      featured: true,
      category: "sport"
    },
    {
      id: 4,
      name: "Kawasaki Ninja 250",
      price: 150000,
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop",
      specs: ["250cc", "Manual", "ABS", "172kg"],
      rating: 4.9,
      reviews: 156,
      featured: true,
      category: "sport"
    },
    {
      id: 5,
      name: "Vespa Sprint",
      price: 80000,
      image: "https://images.unsplash.com/photo-1566891438107-5e0a1e03c7ab?w=400&h=300&fit=crop",
      specs: ["150cc", "Automatic", "CBS", "120kg"],
      rating: 4.6,
      reviews: 89,
      featured: false,
      category: "vintage"
    },
    {
      id: 6,
      name: "Honda ADV150",
      price: 110000,
      image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop",
      specs: ["150cc", "Automatic", "ABS", "134kg"],
      rating: 4.7,
      reviews: 76,
      featured: true,
      category: "adventure"
    }
  ], []);
};

const BookingModal = ({ isOpen, onClose, motor, onConfirm }) => {
  const [step, setStep] = useState(1);
  const modalRef = useRef(null);

  const validateBooking = useCallback((data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Nama harus diisi';
    if (!data.email.trim()) errors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email tidak valid';
    if (!data.phone.trim()) errors.phone = 'Nomor telepon harus diisi';
    if (!data.startDate) errors.startDate = 'Tanggal mulai harus diisi';
    if (!data.endDate) errors.endDate = 'Tanggal selesai harus diisi';
    else if (new Date(data.endDate) <= new Date(data.startDate)) errors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
    return errors;
  }, []);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm } = useFormValidation(
    {
      name: '',
      email: '',
      phone: '',
      startDate: '',
      endDate: '',
      notes: ''
    },
    validateBooking
  );

  const totalDays = values.startDate && values.endDate ? 
    Math.max(1, Math.ceil((new Date(values.endDate) - new Date(values.startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const totalPrice = totalDays * (motor?.price || 0);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBookingSubmit = useCallback((formData) => {
    const bookingData = { ...formData, motor, totalDays, totalPrice };
    console.log('Booking data:', bookingData);
    onConfirm(bookingData);
    setStep(3);
  }, [motor, totalDays, totalPrice, onConfirm]);

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === modalRef.current && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Booking Motor</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              aria-label="Tutup modal"
            >
              <X size={24} />
            </button>
          </div>

          {step === 1 && (
            <div>
              <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={motor.image} 
                  alt={motor.name}
                  className="w-20 h-16 object-cover rounded-lg mr-4"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{motor.name}</h4>
                  <p className="text-blue-600 font-bold">Rp {motor.price.toLocaleString('id-ID')}/hari</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Durasi Sewa</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mulai</label>
                      <input
                        type="date"
                        name="startDate"
                        value={values.startDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {touched.startDate && errors.startDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Selesai</label>
                      <input
                        type="date"
                        name="endDate"
                        value={values.endDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={values.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {touched.endDate && errors.endDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {totalDays > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Total Hari:</span>
                      <span className="font-semibold">{totalDays} hari</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-blue-100">
                      <span>Total Harga:</span>
                      <span className="text-blue-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={totalDays <= 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Lanjutkan ke Data Diri
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleBookingSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan email"
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nomor Telepon *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 081234567890"
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Catatan Tambahan (Opsional)</label>
                  <textarea
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Catatan khusus, permintaan helm, dll."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memproses...
                    </span>
                  ) : (
                    'Konfirmasi Booking'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900">Booking Berhasil!</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Terima kasih telah melakukan booking. Detail konfirmasi telah dikirim ke email Anda. 
                Tim kami akan menghubungi dalam waktu 1x24 jam.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Motor:</span>
                    <span className="font-medium">{motor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durasi:</span>
                    <span className="font-medium">{totalDays} hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);

  const { notifications, addNotification, removeNotification } = useNotifications();
  const motorcycles = useMotorcycleData();

  const testimonials = useMemo(() => [
    {
      name: "Ahmad Fauzi",
      role: "Traveler",
      comment: "Pelayanan sangat baik, motor dalam kondisi prima. Proses booking mudah dan cepat!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Siti Nurhaliza",
      role: "Tour Guide",
      comment: "Banyak pilihan motor yang tersedia, harga terjangkau. Cocok untuk tour keliling kota.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Budi Santoso",
      role: "Freelancer",
      comment: "Booking online sangat membantu, motor langsung bisa diambil. Recommend banget!",
      rating: 4,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ], []);

  // Contact form validation
  const validateContact = useCallback((data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Nama harus diisi';
    if (!data.email.trim()) errors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email tidak valid';
    if (!data.message.trim()) errors.message = 'Pesan harus diisi';
    return errors;
  }, []);

  const contactForm = useFormValidation(
    { name: '', email: '', message: '' },
    validateContact
  );

  // Smooth scroll function
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  }, []);

  // Handle booking
  const handleBooking = useCallback((motor = null) => {
    if (motor) {
      setSelectedMotor(motor);
      // Add to recently viewed
      setRecentlyViewed(prev => {
        const filtered = prev.filter(item => item.id !== motor.id);
        return [motor, ...filtered].slice(0, 3);
      });
    }
    setBookingModalOpen(true);
  }, [setRecentlyViewed]);

  const handleBookingConfirm = useCallback((bookingData) => {
    console.log('Booking confirmed:', bookingData);
    addNotification('Booking berhasil! Konfirmasi telah dikirim ke email Anda.', 'success');
    
    // Simulate API call
    setTimeout(() => {
      addNotification('Tim kami akan menghubungi Anda dalam 30 menit.', 'success', 3000);
    }, 1000);
  }, [addNotification]);

  const handleContactSubmit = useCallback((formData) => {
    console.log('Contact form submitted:', formData);
    addNotification('Pesan terkirim! Kami akan membalas dalam 1x24 jam.', 'success');
    contactForm.resetForm();
  }, [addNotification, contactForm]);

  // PWA Installation
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show prompt after 10 seconds
      setTimeout(() => setShowInstallPrompt(true), 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      addNotification('Aplikasi berhasil diinstall!', 'success');
    }
  }, [installPrompt, addNotification]);

  // Testimonial auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [testimonials.length]);

  // Enhanced features data
  const features = useMemo(() => [
    {
      icon: Award,
      title: "Kualitas Premium",
      description: "Semua motor dalam kondisi prima dan terawat dengan standar tinggi"
    },
    {
      icon: Clock,
      title: "Proses Cepat",
      description: "Booking hanya 2 menit dengan konfirmasi instan"
    },
    {
      icon: MapPin,
      title: "Jangkauan Luas",
      description: "50+ titik pickup strategis di seluruh kota besar"
    },
    {
      icon: Shield,
      title: "Aman & Terjamin",
      description: "Asuransi lengkap dan support 24/7 untuk keamanan Anda"
    }
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="text-center text-white">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">MotorRent</h2>
          <p className="text-blue-100">Menyiapkan pengalaman terbaik untuk Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SEOHead />
      
      <div className="min-h-screen bg-gray-50">
        {/* Install Prompt */}
        <InstallPrompt 
          show={showInstallPrompt}
          onInstall={handleInstallClick}
          onDismiss={() => setShowInstallPrompt(false)}
        />

        {/* Notifications */}
        <NotificationContainer 
          notifications={notifications}
          onRemove={removeNotification}
        />

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Zap className="text-blue-600 mr-2" size={28} />
                  <h1 className="text-2xl font-bold text-blue-600">MotorRent</h1>
                </div>
              </div>
              
              <nav className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {['home', 'motorcycles', 'features', 'testimonials', 'contact'].map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollToSection(item)}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors capitalize hover:bg-blue-50 rounded-lg"
                    >
                      {item === 'home' ? 'Beranda' : 
                       item === 'motorcycles' ? 'Motor' :
                       item === 'features' ? 'Fitur' :
                       item === 'testimonials' ? 'Testimoni' : 'Kontak'}
                    </button>
                  ))}
                </div>
              </nav>

              <div className="hidden md:block">
                <button 
                  onClick={() => handleBooking()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center shadow-lg hover:shadow-xl"
                >
                  <Heart className="mr-2" size={16} />
                  Booking Sekarang
                </button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t animate-slide-in">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['home', 'motorcycles', 'features', 'testimonials', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg capitalize transition-colors"
                  >
                    {item === 'home' ? 'Beranda' : 
                     item === 'motorcycles' ? 'Motor' :
                     item === 'features' ? 'Fitur' :
                     item === 'testimonials' ? 'Testimoni' : 'Kontak'}
                  </button>
                ))}
                <button 
                  onClick={() => handleBooking()}
                  className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                  Booking Sekarang
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section id="home" className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500 rounded-full text-sm mb-6">
                  <Star className="fill-yellow-400 text-yellow-400 mr-2" size={16} />
                  <span>Rating 4.9/5 dari 500+ pelanggan</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Sewa Motor
                  <span className="text-yellow-400"> Modern</span>
                  <br />
                  dengan Mudah
                </h1>
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  Temukan motor impian Anda dengan harga terjangkau dan proses booking yang cepat dan aman. 
                  Layanan 24/7 dengan garansi kepuasan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleBooking()}
                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Booking Sekarang
                    <ArrowRight size={20} className="ml-2" />
                  </button>
                  <button 
                    onClick={() => scrollToSection('motorcycles')}
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Lihat Pilihan Motor
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 mt-8">
                  {['Gratis Helm & Jaket', 'Asuransi Included', 'Delivery Service'].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={20} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative animate-scale-in">
                <img
                  src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop"
                  alt="Motor sport modern untuk disewa"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                  loading="eager"
                />
                <div className="absolute -bottom-6 -left-6 bg-white text-blue-600 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <Star className="fill-yellow-400 text-yellow-400 mr-2" />
                    <span className="font-bold text-lg">4.9/5</span>
                    <span className="text-gray-600 ml-2">(500+ reviews)</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-green-500 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="font-bold text-2xl">50%</div>
                    <div className="text-sm">Off Weekend</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Kenapa Memilih MotorRent?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kami memberikan pengalaman rental motor terbaik dengan berbagai keunggulan eksklusif
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Motorcycles Section */}
        <section id="motorcycles" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pilihan Motor Terbaik
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Temukan motor yang sesuai dengan kebutuhan dan gaya perjalanan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {motorcycles.map((motor) => (
                <div key={motor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  {motor.featured && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow-lg">
                      Featured
                    </div>
                  )}
                  <div className="relative">
                    <img
                      src={motor.image}
                      alt={`Motor ${motor.name} untuk disewa`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{motor.name}</h3>
                      <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                        <Star className="fill-yellow-400 text-yellow-400 mr-1" size={16} />
                        <span className="text-sm font-medium">{motor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {motor.specs.map((spec, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">Rp {motor.price.toLocaleString('id-ID')}</span>
                        <span className="text-gray-500 text-sm">/hari</span>
                      </div>
                      <span className="text-sm text-gray-500">{motor.reviews} reviews</span>
                    </div>

                    <button 
                      onClick={() => handleBooking(motor)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      <Heart className="mr-2" size={16} />
                      Booking Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => scrollToSection('contact')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Lihat Semua Motor
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Apa Kata Pelanggan Kami?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ribuan pelanggan telah mempercayakan perjalanan mereka kepada MotorRent
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover mb-4 md:mb-0 md:mr-8 shadow-lg"
                    loading="lazy"
                  />
                  <div className="text-center md:text-left flex-1">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={i < testimonials[activeTestimonial].rating ? 
                            "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                          size={24} 
                        />
                      ))}
                    </div>
                    <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonials[activeTestimonial].comment}"
                    </blockquote>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{testimonials[activeTestimonial].name}</div>
                      <div className="text-blue-600">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                    }`}
                    aria-label={`Lihat testimoni ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { number: '500+', label: 'Pelanggan Puas' },
                { number: '50+', label: 'Motor Tersedia' },
                { number: '24/7', label: 'Layanan Support' },
                { number: '4.9/5', label: 'Rating Average' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Butuh Bantuan?
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Tim support kami siap membantu 24/7. Hubungi kami melalui berbagai channel yang tersedia.
                </p>
                
                <div className="space-y-6">
                  {[
                    { icon: MapPin, title: "Alamat Kantor", content: "Jl. Raya Kuta No.123, Badung, Bali 80361" },
                    { icon: Phone, title: "Telepon & WhatsApp", content: "+62 812-3456-7890 (24/7 Available)" },
                    { icon: Mail, title: "Email Support", content: "info@motorrent.com\nsupport@motorrent.com" },
                    { icon: Clock, title: "Jam Operasional", content: "Senin - Minggu: 24/7 Nonstop\nPickup & Delivery: 06:00 - 22:00 WITA" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <item.icon size={24} className="text-blue-400 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-300 whitespace-pre-line">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 mt-8">
                  {[
                    { icon: Facebook, label: "Facebook", color: "hover:bg-blue-600" },
                    { icon: Instagram, label: "Instagram", color: "hover:bg-pink-600" },
                    { icon: Twitter, label: "Twitter", color: "hover:bg-blue-400" },
                    { icon: Phone, label: "WhatsApp", color: "hover:bg-green-500" }
                  ].map((social, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      aria-label={social.label}
                    >
                      <social.icon size={24} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
                <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.values.name}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Masukkan nama lengkap Anda"
                    />
                    {contactForm.touched.name && contactForm.errors.name && (
                      <p className="text-red-400 text-sm mt-1">{contactForm.errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.values.email}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Masukkan email Anda"
                    />
                    {contactForm.touched.email && contactForm.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{contactForm.errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Pesan *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={contactForm.values.message}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Tulis pesan atau pertanyaan Anda..."
                    />
                    {contactForm.touched.message && contactForm.errors.message && (
                      <p className="text-red-400 text-sm mt-1">{contactForm.errors.message}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={contactForm.isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {contactForm.isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Pesan'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Zap className="text-blue-400 mr-2" size={24} />
                  <span className="text-xl font-bold">MotorRent</span>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Rental motor terbaik dengan harga terjangkau dan pelayanan prima untuk perjalanan Anda.
                </p>
                <div className="flex space-x-3">
                  {[Facebook, Instagram, Twitter].map((Icon, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      aria-label={`Social media ${index}`}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
              
              {[
                {
                  title: "Layanan",
                  items: ["Sewa Harian", "Sewa Mingguan", "Sewa Bulanan", "Delivery Service"]
                },
                {
                  title: "Perusahaan", 
                  items: ["Tentang Kami", "Syarat & Ketentuan", "Kebijakan Privasi", "Blog"]
                },
                {
                  title: "Kontak",
                  items: ["📞 +62 812-3456-7890", "✉️ info@motorrent.com", "📍 Jl. Raya Kuta No.123, Bali"]
                }
              ].map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                  <ul className="space-y-2 text-gray-300">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <a href="#" className="hover:text-white transition-colors hover:underline">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
              <p>&copy; 2024 MotorRent. All rights reserved. | Made with ❤️ in Bali</p>
            </div>
          </div>
        </footer>

        {/* Booking Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          motor={selectedMotor}
          onConfirm={handleBookingConfirm}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;