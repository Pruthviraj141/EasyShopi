import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";


export default function PublicView() {
    const FloatingElement = ({ children, delay = 0, className = "" }) => (
    <motion.div
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={{
        y: [0, -10, 0],
        opacity: 1
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        delay: delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Your WhatsApp number: +91 8380050609  --> format without "+"
  const WHATSAPP_PHONE = "918380050609";


  useEffect(() => {
    const load = async () => {
      try {
        // 1. Remove orderBy() to get products without a specific sort order from Firestore.
        const q = query(collection(db, "products"));
        const snap = await getDocs(q);
        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 2. Shuffle the array to randomize the order.
        // The sort() method with a random return value is a standard way to shuffle an array.
        list = list.sort(() => Math.random() - 0.5);

        setProducts(list);
        
        // Extract unique categories from the now-shuffled product list.
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

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

const makeWhatsAppUrl = (p) => {
  const title = p.title || "🛍️ Product";
  const priceLine = p.price ? `💰 Price: ₹${p.price}` : "💰 Price on request";
  const imageUrl =
    Array.isArray(p.imageURLs) && p.imageURLs.length > 0
      ? p.imageURLs[0]
      : p.imageURL;

  const message = 
    `✨ Hi, I'm interested in this item!\n\n` +
    `📦 *${title}*\n` +
    `${priceLine}\n\n` +
    (imageUrl ? `🖼️ Product Image: ${imageUrl}\n\n` : "") +
    `✅ I’d like to confirm availability & place an order.\n\n` +
    `Please share the details. 🙏`;

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

  // Add to cart function
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update quantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between animate-fade-in-down">
        <div className="flex items-center justify-center w-full">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            EasyShopi<FloatingElement delay={0.5} className="absolute top-40 right-20 text-3xl opacity-10 xl:top-40 xl:right-40">
        🌸
      </FloatingElement>

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
        <div className="hidden md:flex space-x-4 items-center">
            <button
              onClick={() => navigate('/about-us')}
              className="text-sm font-medium text-teal-500 hover:text-teal-700 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
              className="text-sm font-medium text-pink-600 hover:text-pink-800 transition-colors"
            >
              Admin
            </button>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => navigate('/about-us')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50"
            >
              About Us
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("open-login"));
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-pink-600 hover:bg-pink-50"
            >
              Admin
            </button>
          </div>
        </div>
      )}
      
      {/* Category filter bar */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 w-max md:justify-center md:mx-auto md:w-full">
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

      <main className="p-4 pt-0 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-6">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading exquisite collection...</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-gray-200 to-gray-300 h-64"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                    <div className="mt-4 flex space-x-3">
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex-1"></div>
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .map((p, index) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] border border-gray-100"
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div className="w-full h-64 bg-gray-200 relative">
                    {Array.isArray(p.imageURLs) && p.imageURLs.length > 0 ? (
                      <ImageSlider images={p.imageURLs} alt={p.title} />
                    ) : (
                      <img
                        src={p.imageURL}
                        alt={p.title}
                        className="w-full h-full object-contain rounded-t-2xl"
                        loading="lazy"
                      />
                    )}
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="font-bold text-xl leading-tight line-clamp-2">
  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
    {p.title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')}
  </span>
  {p.title.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu)}
</h2>
                    {p.price && (
                      <p className="text-xl text-teal-600 mt-3 font-bold">
                        ₹{p.price}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col space-y-3">
                    <a
                      href={makeWhatsAppUrl(p)}
                      className="flex-1 text-center py-3 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 448 512" fill="currentColor">
                        <path d="M380.9 97.1C339.5 55.7 283.7 32 223.9 32c-122.9 0-224 101.3-224 225.8 0 39.5 10.7 78 31.4 112.5L7.6 448l122.1-32.8c32.7 17.7 69.3 27 106.3 27 122.9 0 224-101.3 224-225.8 0-59.3-23.4-115.1-64.4-156.9zM223.9 417.8c-29.2 0-57.8-8.9-81.5-25.5l-5.6-3.3-60.8 16.3 16.6-62.1-3.7-5.9c-19.1-30.8-29.2-66.2-29.2-103.5 0-101.6 82.8-184.4 184.6-184.4 50 0 97.4 19.5 132.9 54.1 35.5 34.6 55.1 82.2 55.1 133 0 101.6-82.8 184.4-184.6 184.4zm105.7-142.3c-5.7-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.9 2.8-3.9 5.7-14.8 18.4-18.1 22.1-3.3 3.6-6.6 4.1-12.3 1.3-6.1-3.3-25.9-9.5-49.3-30.4-18.2-16.1-30.5-35.9-34-41.9-3.6-6-0.4-9.3 2.5-12.2 2.5-2.5 5.7-6.5 8.5-9.8 2.8-3.3 3.6-5.7 5.4-9.5 1.9-3.9.9-7.2-0.5-10.1-1.3-2.8-12.9-31.1-17.7-42.6-4.8-11.5-9.6-9.9-12.9-10.1-3.3-0.2-7-0.2-10.7-0.2-3.7 0-9.7 1.3-14.8 6.5-5.2 5.2-19.9 19.3-19.9 47.1 0 27.8 20.3 54.7 23.2 58.4 2.8 3.6 40 61.2 97.2 86.8 21.6 9.4 38.6 15.1 51.9 19.4 19.4 6.5 37.1 5.6 51-1.7 15.2-7.5 33.4-29.3 38.1-58 4.7-28.7 4.7-26.6 3.3-28.9-1.3-2.3-5-3.6-10.7-6.5z"/>
                      </svg>
                      Buy on WhatsApp
                    </a>
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full sm:w-auto py-3 px-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
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

      {/* Floating cart icon */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 left-6 z-20 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out translate-y-0 h-3/4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center py-4 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.imageURLs && item.imageURLs.length > 0 ? (
                          <img src={item.imageURLs[0]} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <img src={item.imageURL} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-teal-600 font-bold">₹{item.price}</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                          >
                            -
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={() => {
                    // Generate WhatsApp message
                    const message = `I'd like to order these products:\n\n${cart.map(item => `${item.title} x ${item.quantity} = ₹${item.price}`).join('\n')}\n\n${cart.map(item => `Product: ${item.title}\nLink: ${Array.isArray(item.imageURLs) && item.imageURLs.length > 0 ? item.imageURLs[0] : item.imageURL}`).join('\n\n')}`;
                    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M380.9 97.1C339.5 55.7 283.7 32 223.9 32c-122.9 0-224 101.3-224 225.8 0 39.5 10.7 78 31.4 112.5L7.6 448l122.1-32.8c32.7 17.7 69.3 27 106.3 27 122.9 0 224-101.3 224-225.8 0-59.3-23.4-115.1-64.4-156.9zM223.9 417.8c-29.2 0-57.8-8.9-81.5-25.5l-5.6-3.3-60.8 16.3 16.6-62.1-3.7-5.9c-19.1-30.8-29.2-66.2-29.2-103.5 0-101.6 82.8-184.4 184.6-184.4 50 0 97.4 19.5 132.9 54.1 35.5 34.6 55.1 82.2 55.1 133 0 101.6-82.8 184.4-184.6 184.4zm105.7-142.3c-5.7-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.9 2.8-3.9 5.7-14.8 18.4-18.1 22.1-3.3 3.6-6.6 4.1-12.3 1.3-6.1-3.3-25.9-9.5-49.3-30.4-18.2-16.1-30.5-35.9-34-41.9-3.6-6-0.4-9.3 2.5-12.2 2.5-2.5 5.7-6.5 8.5-9.8 2.8-3.3 3.6-5.7 5.4-9.5 1.9-3.9.9-7.2-0.5-10.1-1.3-2.8-12.9-31.1-17.7-42.6-4.8-11.5-9.6-9.9-12.9-10.1-3.3-0.2-7-0.2-10.7-0.2-3.7 0-9.7 1.3-14.8 6.5-5.2 5.2-19.9 19.3-19.9 47.1 0 27.8 20.3 54.7 23.2 58.4 2.8 3.6 40 61.2 97.2 86.8 21.6 9.4 38.6 15.1 51.9 19.4 19.4 6.5 37.1 5.6 51-1.7 15.2-7.5 33.4-29.3 38.1-58 4.7-28.7 4.7-26.6 3.3-28.9-1.3-2.3-5-3.6-10.7-6.5z"/>
                  </svg>
                  Send Order on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
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
    <div className="relative w-full h-full rounded-t-2xl overflow-hidden bg-gray-200">
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