import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// ====== Cloudinary Config (fill these two) ======
const CLOUDINARY_CLOUD_NAME = "dbkszv0bm";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_sari";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function AdminPanel() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNewCategory, setEditNewCategory] = useState("");
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);

  // Real-time products
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });
    return () => unsub();
  }, []);

  // Extract categories from products
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setEditImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setEditImagePreviews(previews);
  };

  async function uploadToCloudinary(file, index, total) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "sari-store");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", CLOUDINARY_UPLOAD_URL);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const totalProgress = Math.round(
            ((e.loaded / e.total) * 100 + index * 100) / total
          );
          setProgress(totalProgress);
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } else {
              reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
            }
          } catch (err) {
            reject(err);
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !imageFiles.length) {
      alert("Please enter a title and choose at least one image.");
      return;
    }

    // Determine the category to use
    const categoryToUse = newCategory.trim() || category;

    if (!categoryToUse) {
      alert("Please select a category or create a new one.");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      // 1) Upload all images to Cloudinary
      const uploadPromises = imageFiles.map((file, index) =>
        uploadToCloudinary(file, index, imageFiles.length)
      );
      const results = await Promise.all(uploadPromises);
      const imageURLs = results.map((res) => res.secure_url);

      // 2) Save product to Firestore
      await addDoc(collection(db, "products"), {
        title: title.trim(),
        price: price.trim(),
        category: categoryToUse,
        // Keep imageURL for backward compatibility
        imageURL: imageURLs[0],
        imageURLs,
        createdAt: serverTimestamp(),
      });

      // 3) Reset form
      setTitle("");
      setPrice("");
      setCategory("");
      setNewCategory("");
      setImageFiles([]);
      setImagePreviews([]);
      setProgress(0);

      alert("Product uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
  };
  
  const startEditing = (product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price);
    setEditCategory(product.category);
    setEditNewCategory("");
    setEditImageFiles([]);
    setEditImagePreviews(product.imageURLs || (product.imageURL ? [product.imageURL] : []));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    let newImageURLs = editingProduct.imageURLs || (editingProduct.imageURL ? [editingProduct.imageURL] : []);
    
    // Check if new images were selected
    if (editImageFiles.length > 0) {
      try {
        const uploadPromises = editImageFiles.map((file, index) =>
          uploadToCloudinary(file, index, editImageFiles.length)
        );
        const results = await Promise.all(uploadPromises);
        newImageURLs = results.map((res) => res.secure_url);
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Image upload failed. Update cancelled.");
        setLoading(false);
        return;
      }
    }

    const categoryToUse = editNewCategory.trim() || editCategory;

    if (!categoryToUse) {
        alert("Please select a category or create a new one.");
        setLoading(false);
        return;
    }

    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        title: editTitle.trim(),
        price: editPrice.trim(),
        category: categoryToUse,
        imageURLs: newImageURLs,
        imageURL: newImageURLs[0], // Keep for backward compatibility
      });
      alert("Product updated successfully!");
      setEditingProduct(null);
      setEditTitle("");
      setEditPrice("");
      setEditCategory("");
      setEditNewCategory("");
      setEditImageFiles([]);
      setEditImagePreviews([]);
      setProgress(0);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-pink-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-pink-600">Admin Panel</h1>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Upload Form */}
      {!editingProduct && (
        <form
          onSubmit={handleUpload}
          className="bg-white p-4 rounded-xl shadow mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">Add New Product</h2>
          <label className="block text-sm mb-1">Product Title</label>
          <input
            type="text"
            placeholder="e.g., Banarasi Silk Saree"
            className="w-full p-2 mb-3 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="block text-sm mb-1">Price (optional)</label>
          <input
            type="number"
            placeholder="e.g., 1499"
            className="w-full p-2 mb-3 border rounded-lg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
          />

          <label className="block text-sm mb-1">Category</label>
          <div className="flex space-x-2 mb-3">
            <select
              className="flex-1 p-2 border rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or create new"
              className="flex-1 p-2 border rounded-lg"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>

          <label className="block text-sm mb-1">Images</label>
          <input type="file" accept="image/*" multiple className="mb-3" onChange={handleImageChange} />

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`preview-${index}`}
                  className="w-28 h-28 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {loading && (
            <div className="w-full h-2 bg-gray-100 rounded mb-3">
              <div
                className="h-2 bg-pink-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600"
          >
            {loading ? `Uploading… ${progress}%` : "Upload Product"}
          </button>
        </form>
      )}

      {/* Edit Form */}
      {editingProduct && (
        <form
          onSubmit={handleUpdate}
          className="bg-white p-4 rounded-xl shadow mb-6"
        >
          <h2 className="text-lg font-semibold mb-3">Edit Product</h2>
          <label className="block text-sm mb-1">Product Title</label>
          <input
            type="text"
            className="w-full p-2 mb-3 border rounded-lg"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <label className="block text-sm mb-1">Price (optional)</label>
          <input
            type="number"
            className="w-full p-2 mb-3 border rounded-lg"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            min="0"
          />

          <label className="block text-sm mb-1">Category</label>
          <div className="flex space-x-2 mb-3">
            <select
              className="flex-1 p-2 border rounded-lg"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or create new"
              className="flex-1 p-2 border rounded-lg"
              value={editNewCategory}
              onChange={(e) => setEditNewCategory(e.target.value)}
            />
          </div>

          <label className="block text-sm mb-1">Images (leave blank to keep current images)</label>
          <input type="file" accept="image/*" multiple className="mb-3" onChange={handleEditImageChange} />

          {editImagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {editImagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`preview-${index}`}
                  className="w-28 h-28 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {loading && (
            <div className="w-full h-2 bg-gray-100 rounded mb-3">
              <div
                className="h-2 bg-pink-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
            >
              {loading ? `Updating… ${progress}%` : "Update Product"}
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="flex-1 bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white p-3 rounded-lg shadow flex flex-col sm:flex-row items-center justify-between"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <img
                src={p.imageURL}
                alt={p.title}
                className="w-16 h-16 object-cover rounded-lg"
                loading="lazy"
              />
              <div>
                <h2 className="font-semibold">{p.title}</h2>
                {p.price && <p className="text-sm text-gray-500">₹{p.price}</p>}
                {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => startEditing(p)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-sm text-gray-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}