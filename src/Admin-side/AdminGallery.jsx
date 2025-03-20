import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, push, onValue, remove } from "firebase/database";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { Trash, Plus, Upload, Loader,Edit } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast'; // ✅ Import Toaster for notifications


import Dropzone from "react-dropzone";

function AdminGallery() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState({ id: "", name: "" });
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false);
const [deleteTargetImageId, setDeleteTargetImageId] = useState(null);

  const db = getDatabase();

  // Fetch categories from Firebase
  useEffect(() => {
    setIsLoading(true);
    const categoriesRef = ref(db, "categories");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.entries(data).map(([id, name]) => ({ id, name })) : []);
      setIsLoading(false);
    });
  }, [db]);

  // Fetch images based on selected category
  useEffect(() => {
    if (!selectedCategory) return;
    setIsLoading(true);
    const imagesRef = ref(db, `gallery/${selectedCategory}`);
    onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      setImages(data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : []);
      setIsLoading(false);
    });
  }, [db, selectedCategory]);

  // Handle category editing
  const handleEditCategory = async () => {
    if (!editCategory.name.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      await set(ref(db, `categories/${editCategory.id}`), editCategory.name);
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editCategory.id ? { ...category, name: editCategory.name } : category
        )
      );
      toast.success("Category name updated successfully!");
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setIsEditDialogOpen(false);
      setEditCategory({ id: "", name: "" });
    }
  };


  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(ref(db, `categories/${deleteTarget.id}`));
      setCategories((prev) => prev.filter((category) => category.id !== deleteTarget.id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };


  // Handle image deletion
  const handleDeleteImage = (imageId) => {
    setDeleteTargetImageId(imageId);
    setIsDeleteImageDialogOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!deleteTargetImageId) return;
  
    try {
      const imageRef = ref(db, `gallery/${selectedCategory}/${deleteTargetImageId}`);
      await remove(imageRef);
  
      setImages((prevImages) => prevImages.filter((image) => image.id !== deleteTargetImageId));
  
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setIsDeleteImageDialogOpen(false);
      setDeleteTargetImageId(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const categoryRef = ref(db, "categories");
      const newCategoryRef = push(categoryRef);
      await set(newCategoryRef, newCategory);
      setNewCategory("");
      setShowCategoryModal(false);
      toast.success("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  // Handle file upload
  const handleSubmit = async () => {
    if (!selectedCategory || previewImages.length === 0) {
      toast.error("Select a category and upload images");
      return;
    }
    setIsUploading(true);
    try {
      const uploadedImageUrls = [];
      for (const image of previewImages) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "gallery");
        const response = await axios.post("https://api.cloudinary.com/v1_1/dntyrf9un/image/upload", formData);
        uploadedImageUrls.push(response.data.secure_url);
      }
      const categoryRef = ref(db, `gallery/${selectedCategory}`);
      uploadedImageUrls.forEach((imageUrl) => push(categoryRef, { url: imageUrl }));
      toast.success("Images uploaded successfully!");
      setPreviewImages([]); // Reset preview images after successful upload
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      // Reference for category and its images
      const categoryRef = ref(db, `categories/${categoryId}`);
      const imagesRef = ref(db, `gallery/${categoryId}`);

      // Remove category and images
      await remove(categoryRef);
      await remove(imagesRef);

      // Update state by filtering out deleted category
      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId));

      // Reset selected category if it's the one deleted
      if (selectedCategory === categoryId) {
        setSelectedCategory("");
        setImages([]); // Clear images if the category was deleted
      }

      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      <Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: "#000", // Black background
      color: "#fff", // White text
      border: "1px solid #fff", // White border
    },
  }}
/>
      {/* Sidebar */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p>Are you sure you want to delete this category?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setIsDeleteDialogOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-black text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl transition-transform transform scale-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Category</h3>
      <input
        type="text"
        value={editCategory.name}
        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
        placeholder="Enter category name"
      />
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setIsEditDialogOpen(false)}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleEditCategory}
          className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</Dialog>


      <Dialog open={isDeleteImageDialogOpen} onClose={() => setIsDeleteImageDialogOpen(false)}>
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold">Confirm Deletion</h3>
      <p>Are you sure you want to delete this image?</p>
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={() => setIsDeleteImageDialogOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button onClick={confirmDeleteImage} className="px-4 py-2 bg-black text-white rounded">Delete</button>
      </div>
    </div>
  </div>
</Dialog>
      <div className="w-1/4 p-4 bg-white shadow-md">
        <h2 className="text-lg font-semibold tracking-wide">Categories</h2>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="w-full bg-black text-white py-2 rounded-md mt-4 flex items-center justify-center transition hover:bg-gray-800"
        >
          <Plus className="mr-2" size={16} /> Add Category
        </button>
        <ul className="mt-4 space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`p-2 cursor-pointer rounded-md text-sm transition ${
                selectedCategory === cat.id ? "bg-black text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div className="flex justify-between items-center">
                <span>{cat.name}</span>
                <div className="flex space-x-2">
                <button onClick={() => { setEditCategory(cat); setIsEditDialogOpen(true); }}>
                <Edit size={16} />
              </button>
              <button onClick={() => { setDeleteTarget(cat); setIsDeleteDialogOpen(true); }}>
                <Trash size={16} />
              </button>
              </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Manage Gallery</h1>

        {/* Dropzone for uploading new images */}
        <Dropzone onDrop={(acceptedFiles) => {
          setPreviewImages((prev) => [
            ...prev,
            ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
          ]);
        }} multiple accept={{ 'image/*': [] }}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="border-2 border-gray-300 border-dashed p-6 text-center cursor-pointer bg-white shadow-md rounded-lg transition hover:border-black">
              <input {...getInputProps()} />
              <Upload className="mx-auto text-gray-500" size={40} />
              <p className="mt-2 text-gray-700">Drag & drop images here or click to select</p>
            </div>
          )}
        </Dropzone>

        {/* Preview Images before upload */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {previewImages.map((file, index) => (
              <img key={index} src={file.preview} alt="Preview" className="w-full h-32 object-cover rounded-md shadow-md" />
            ))}
          </div>
        )}

        <button onClick={handleSubmit} disabled={isUploading} className="bg-black text-white px-4 py-2 rounded-md w-full mt-4 transition hover:bg-gray-800">
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>

        {/* Loader for Gallery */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="animate-spin text-black" size={32} />
            <p className="ml-2">Loading gallery...</p>
          </div>
        ) : (
          selectedCategory && images.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img src={image.url} alt="Uploaded" className="w-full h-40 object-cover rounded-md shadow-md" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleDeleteImage(image.id)} className="bg-black text-white p-1 rounded-full shadow-md hover:bg-red-700">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            selectedCategory && <p>No images available for this category.</p>
          )
        )}
      </div>
      {showCategoryModal && (
      <Dialog open={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">Add New Category</h2>
          
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-500 rounded-lg p-3 text-lg focus:ring-2 focus:ring-black-500 focus:border-black-700 outline-none transition-all"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          
          <div className="mt-10 flex justify-end space-x-3">
            <button 
              onClick={() => setShowCategoryModal(false)} 
              className="px-5 py-3 bg-gray-200 text-gray-700 text-lg rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddCategory} 
              className="px-5 py-3 bg-black text-white text-lg rounded-lg transition-all hover:bg-gray-400 hover:text-black"
            >
              Add Category
            </button>


          </div>
        </div>
      </div>
    </Dialog>
    
     
      )}
    </div>
  );
}

export default AdminGallery;
