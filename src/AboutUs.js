import React, { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

// A more polished and reusable TypingText component
const TypingText = forwardRef(({ text, delay = 0, className = "" }, ref) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50 + delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span ref={ref} className={`font-mono inline-block ${className}`}>
      {displayText}
    </span>
  );
});

// Reusable FloatingElement with the original animation logic
const FloatingElement = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [0, -10, 0], opacity: 1 }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      delay: delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Animation variants for better code organization
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function App() {
  const navigate = useNavigate();

  // Use react-intersection-observer for more efficient scroll animations
  const { ref: storyRef, inView: isStoryVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const { ref: missionRef, inView: isMissionVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const { ref: githubRef, inView: isGithubVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const { ref: contactRef, inView: isContactVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden">
      {/* Floating decorative elements */}
      <FloatingElement delay={0} className="top-20 left-10 text-4xl opacity-10">
        ✨
      </FloatingElement>
      <FloatingElement delay={0.5} className="top-44 right-2 text-3xl opacity-10">
        🌸
      </FloatingElement>
      <FloatingElement delay={1} className="bottom-40 left-20 text-4xl opacity-10">
        💎
      </FloatingElement>
      <FloatingElement delay={1.5} className="bottom-20 right-10 text-3xl opacity-10">
        🌺
      </FloatingElement>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex-1 text-center">
          <motion.h1
            className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sarees & Dresses
          </motion.h1>
        </div>
        <motion.button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center p-2 rounded-lg hover:bg-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </motion.button>
      </header>

      <main className="p-4 md:max-w-4xl md:mx-auto relative z-10">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TypingText text="Our Story, Our Craft." />
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover our passion for traditional Indian textiles and the mission that drives us.
          </motion.p>
        </section>

        {/* Our Story Section */}
        <section ref={storyRef} className="py-16">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            variants={containerVariants}
            initial="hidden"
            animate={isStoryVisible ? "visible" : "hidden"}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-6 text-center text-gray-900">
              Our Journey
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-700 text-lg leading-relaxed mb-6">
              Founded on the belief that traditional Indian textiles deserve a global stage, **Sarees & Dresses** began as a small initiative to bridge the gap between skilled artisans and discerning customers. We are more than just a brand; we're a platform committed to preserving heritage and empowering local communities.
            </motion.p>
            <motion.p variants={itemVariants} className="text-gray-700 text-lg leading-relaxed mb-6">
              Our unique **WhatsApp-based shopping model** simplifies the entire buying process. You can explore our meticulously curated collections, get personalized recommendations, and complete your purchase directly with our team, all from the convenience of your phone.
            </motion.p>
            <motion.p variants={itemVariants} className="text-gray-700 text-lg leading-relaxed">
            </motion.p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section ref={missionRef} className="py-16">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col items-center text-center"
            variants={containerVariants}
            initial="hidden"
            animate={isMissionVisible ? "visible" : "hidden"}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-6 text-gray-900">
              Our Mission
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-700 text-lg max-w-2xl">
              To provide the finest traditional Indian textiles at accessible prices, while fostering a direct and meaningful connection between our customers and the artisans who create these beautiful pieces. We aim to celebrate craftsmanship and make cultural elegance effortless.
            </motion.p>
          </motion.div>
        </section>

        {/* CTA Section for GitHub */}
        <section ref={githubRef} className="py-16">
          <motion.div
            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white text-center"
            variants={containerVariants}
            initial="hidden"
            animate={isGithubVisible ? "visible" : "hidden"}
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              Explore Our Project
            </motion.h2>
            <motion.p variants={itemVariants} className="text-teal-100 mb-8 max-w-2xl mx-auto">
              We believe in open development. Check out our GitHub repository to see the technology behind our platform and contribute to our growth.
            </motion.p>
            <motion.a
              variants={itemVariants}
              href="https://github.com/Pruthviraj141/EasyShopi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-full shadow-lg transition-transform duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 12px 28px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.465-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.771.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.56 21.828 24 17.32 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </span>
            </motion.a>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-16">
          <motion.div
            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white text-center"
            variants={containerVariants}
            initial="hidden"
            animate={isContactVisible ? "visible" : "hidden"}
          >
            <motion.h3 variants={itemVariants} className="text-3xl font-bold mb-2">
              Have a Question?
            </motion.h3>
            <motion.p variants={itemVariants} className="text-teal-100 mb-8">
              We'd love to hear from you. Get in touch with our team directly.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.a
                href="https://wa.me/918380050609"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white text-teal-600 font-bold py-3 px-8 rounded-full shadow-lg transition-transform duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 12px 28px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M380.9 97.1C339.5 55.7 283.7 32 223.9 32c-122.9 0-224 101.3-224 225.8 0 39.5 10.7 78 31.4 112.5L7.6 448l122.1-32.8c32.7 17.7 69.3 27 106.3 27 122.9 0 224-101.3 224-225.8 0-59.3-23.4-115.1-64.4-156.9zM223.9 417.8c-29.2 0-57.8-8.9-81.5-25.5l-5.6-3.3-60.8 16.3 16.6-62.1-3.7-5.9c-19.1-30.8-29.2-66.2-29.2-103.5 0-101.6 82.8-184.4 184.6-184.4 50 0 97.4 19.5 132.9 54.1 35.5 34.6 55.1 82.2 55.1 133 0 101.6-82.8 184.4-184.6 184.4zm105.7-142.3c-5.7-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.9 2.8-3.9 5.7-14.8 18.4-18.1 22.1-3.3 3.6-6.6 4.1-12.3 1.3-6.1-3.3-25.9-9.5-49.3-30.4-18.2-16.1-30.5-35.9-34-41.9-3.6-6-0.4-9.3 2.5-12.2 2.5-2.5 5.7-6.5 8.5-9.8 2.8-3.3 3.6-5.7 5.4-9.5 1.9-3.9.9-7.2-0.5-10.1-1.3-2.8-12.9-31.1-17.7-42.6-4.8-11.5-9.6-9.9-12.9-10.1-3.3-0.2-7-0.2-10.7-0.2-3.7 0-9.7 1.3-14.8 6.5-5.2 5.2-19.9 19.3-19.9 47.1 0 27.8 20.3 54.7 23.2 58.4 2.8 3.6 40 61.2 97.2 86.8 21.6 9.4 38.6 15.1 51.9 19.4 19.4 6.5 37.1 5.6 51-1.7 15.2-7.5 33.4-29.3 38.1-58 4.7-28.7 4.7-26.6 3.3-28.9-1.3-2.3-5-3.6-10.7-6.5z" />
                </svg>
                WhatsApp
              </motion.a>
<motion.a
  href="mailto:pruthviraj.22420262@viit.ac.in"
  className="flex items-center justify-center bg-white/20 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform duration-300"
  whileHover={{ scale: 1.05, boxShadow: "0 12px 28px rgba(0,0,0,0.2)" }}
  whileTap={{ scale: 0.95 }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
  Email
</motion.a>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 mb-8 text-center text-xs text-gray-400 relative z-10">
        © 2024 Sarees & Dresses. Made with ❤️ for the world.
      </footer>
    </div>
  );
}

