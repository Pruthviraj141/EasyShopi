import React, { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function PublicView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Your WhatsApp number: +91 8380050609  --> format without "+"
  const WHATSAPP_PHONE = "918380050609";

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(list.map(product => product.category).filter(Boolean))];
        setCategories(['All', ...uniqueCategories]);
      } catch (e) {
        console.error("Error loading products:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Preload first product image
  useEffect(() => {
    if (products.length > 0) {
      const firstProduct = products[0];
      if (firstProduct.imageURLs && firstProduct.imageURLs.length > 0) {
        const img = new Image();
        img.src = firstProduct.imageURLs[0];
      } else if (firstProduct.imageURL) {
        const img = new Image();
        img.src = firstProduct.imageURL;
      }
    }
  }, [products]);

  const makeWhatsAppUrl = (p) => {
    const title = p.title || "Product";
    const priceLine = p.price ? `Price: ₹${p.price}` : "";
    const imageUrl = Array.isArray(p.imageURLs) && p.imageURLs.length > 0 ? p.imageURLs?.[0] : p.imageURL;
    const message =
      `${title}\n${priceLine}\n\nImage: ${imageUrl}\n\n` +
      `I want to buy this. Please confirm availability.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  };

  const handleShare = async (p) => {
    const imageUrl = Array.isArray(p.imageURLs) && p.imageURLs.length > 0 ? p.imageURLs?.[0] : p.imageURL;
    try {
      if (navigator?.canShare && navigator.canShare({ files: [] })) {
        const res = await fetch(imageUrl, { mode: "cors" });
        const blob = await res.blob();
        const file = new File([blob], "product.jpg", { type: blob.type || "image/jpeg" });
        await navigator.share({
          title: p.title,
          text: p.price ? `${p.title} - ₹${p.price}` : p.title,
          files: [file],
        });
        return;
      }
    } catch (err) {
      console.warn("Native share failed; falling back to WhatsApp link.", err);
    }
    window.open(makeWhatsAppUrl(p), "_blank");
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between animate-fade-in-down">
        <div className="flex items-center justify-center w-full">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            Sarees & Dresses
          </h1>
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden text-teal-600 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <button
          onClick={scrollToTop}
          className="hidden md:block text-sm font-medium text-teal-500 hover:text-teal-700 transition-colors"
        >
          Top ↑
        </button>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={scrollToTop}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50"
            >
              Back to Top
            </button>
          </div>
        </div>
      )}
      
      {/* Category filter bar */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 pt-0 md:max-w-xl md:mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-6">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading exquisite collection...</p>
            <div className="w-full space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"></div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex-1"></div>
                        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center mt-20">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">No products available yet</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {products
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .map((p, index) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] border border-gray-100"
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative flex-shrink-0 sm:w-1/3">
                    {Array.isArray(p.imageURLs) && p.imageURLs.length > 0 ? (
                      <ImageSlider images={p.imageURLs} alt={p.title} />
                    ) : (
                      <img
                        src={p.imageURL}
                        alt={p.title}
                        className="w-full h-48 sm:h-auto object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-xl leading-tight line-clamp-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {p.title}
                      </h2>
                      {p.price && (
                        <p className="text-xl text-teal-600 mt-3 font-bold">
                          ₹{p.price}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <a
                        href={makeWhatsAppUrl(p)}
                        className="flex-1 text-center py-4 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 448 512" fill="currentColor">
                          <path d="M380.9 97.1C339.5 55.7 283.7 32 223.9 32c-122.9 0-224 101.3-224 225.8 0 39.5 10.7 78 31.4 112.5L7.6 448l122.1-32.8c32.7 17.7 69.3 27 106.3 27 122.9 0 224-101.3 224-225.8 0-59.3-23.4-115.1-64.4-156.9zM223.9 417.8c-29.2 0-57.8-8.9-81.5-25.5l-5.6-3.3-60.8 16.3 16.6-62.1-3.7-5.9c-19.1-30.8-29.2-66.2-29.2-103.5 0-101.6 82.8-184.4 184.6-184.4 50 0 97.4 19.5 132.9 54.1 35.5 34.6 55.1 82.2 55.1 133 0 101.6-82.8 184.4-184.6 184.4zm105.7-142.3c-5.7-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.9 2.8-3.9 5.7-14.8 18.4-18.1 22.1-3.3 3.6-6.6 4.1-12.3 1.3-6.1-3.3-25.9-9.5-49.3-30.4-18.2-16.1-30.5-35.9-34-41.9-3.6-6-0.4-9.3 2.5-12.2 2.5-2.5 5.7-6.5 8.5-9.8 2.8-3.3 3.6-5.7 5.4-9.5 1.9-3.9.9-7.2-0.5-10.1-1.3-2.8-12.9-31.1-17.7-42.6-4.8-11.5-9.6-9.9-12.9-10.1-3.3-0.2-7-0.2-10.7-0.2-3.7 0-9.7 1.3-14.8 6.5-5.2 5.2-19.9 19.3-19.9 47.1 0 27.8 20.3 54.7 23.2 58.4 2.8 3.6 40 61.2 97.2 86.8 21.6 9.4 38.6 15.1 51.9 19.4 19.4 6.5 37.1 5.6 51-1.7 15.2-7.5 33.4-29.3 38.1-58 4.7-28.7 4.7-26.6 3.3-28.9-1.3-2.3-5-3.6-10.7-6.5z"/>
                        </svg>
                        Buy on WhatsApp
                      </a>
                      <button
                        onClick={() => handleShare(p)}
                        className="w-full sm:w-auto py-4 px-6 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-teal-600 transition-colors duration-300" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M352 144c0 44.11-35.89 80-80 80s-80-35.89-80-80 35.89-80 80-80 80 35.89 80 80zm-80 16c-8.84 0-16 7.16-16 16v16h-48v-16c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-16h48v16c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16 16v-48c0-8.84-7.16-16-16-16h-16zm96-128c-52.94 0-96 43.06-96 96 0 14.86 3.48 29.13 9.74 42.42L256 224h106.26c6.26-13.29 9.74-27.56 9.74-42.42 0-52.94-43.06-96-96-96zm-96 0c-52.94 0-96 43.06-96 96 0 14.86 3.48 29.13 9.74 42.42L256 224h-106.26c-6.26-13.29-9.74-27.56-9.74-42.42 0-52.94 43.06-96 96-96zm176 128c0 88.37-71.63 160-160 160s-160-71.63-160-160h-32c-17.67 0-32 14.33-32 32v256c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V384c0-17.67-14.33-32-32-32h-32v-16c0-62.43 50.7-112 112-112s112 49.57 112 112v16h-32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V256c0-17.67-14.33-32-32-32h-32zM288 384h-64c-17.67 0-32-14.33-32-32v-32c0-17.67 14.33-32 32-32h64c17.67 0 32 14.33 32 32v32c0 17.67-14.33 32-32 32z"/>
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 mb-12 text-center text-xs text-gray-400">
        Made for mobile • Secure WhatsApp checkout
      </footer>

      {/* Floating admin access */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
        className="fixed bottom-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-white text-pink-600 rounded-full shadow-lg border border-pink-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Admin"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      {/* Floating back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-20 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

function ImageSlider({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  const goToPrevious = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, images.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, images.length]);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // Handle image load
  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  // Preload all images
  useEffect(() => {
    const preloadImages = () => {
      images.forEach((image, index) => {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          handleImageLoad(index);
        };
      });
    };

    preloadImages();
  }, [images, handleImageLoad]);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [goToNext]);

  return (
    <div className="relative w-full pb-[100%] rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden bg-gray-200">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {!loadedImages[index] && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={image}
            alt={`${alt} - ${index + 1}`}
            className="w-full h-full object-contain"
            loading={index === 0 ? "eager" : "lazy"}
            onLoad={() => handleImageLoad(index)}
          />
        </div>
      ))}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full p-2 z-20 hover:bg-opacity-50 transition-all duration-300 transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full p-2 z-20 hover:bg-opacity-50 transition-all duration-300 transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-2 left-0 w-full flex items-center justify-center space-x-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-teal-500 w-6' : 'bg-gray-300'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}