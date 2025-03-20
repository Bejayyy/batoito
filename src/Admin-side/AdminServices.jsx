import React, { useState, useEffect, useRef } from 'react';
import { db } from '../Firebase/Firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc,getDocs } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import uploadIcon from './images/uploadicon.png';
import axios from "axios";

function AdminServices() {

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State for edit 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [thumbnails, setThumbnails] = useState([null, null, null]);
  const [inclusions, setInclusions] = useState([]);
  const [newInclusion, setNewInclusion] = useState('');
  const [services, setServices] = useState([]);
  const [rating, setRating] = useState();
  const fileInputRefs = useRef([...Array(4)].map(() => React.createRef()));
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null); // Stores the action to confirm
  const [confirmationData, setConfirmationData] = useState(null); // Stores data for the action (e.g., service ID)


  // Handler for confirming an action
  const handleConfirmAction = async () => {
    setLoading(true); // Start loading
    try {
      if (confirmationAction === "add") {
        await handleAddService({ preventDefault: () => {} }); // Pass a mock event object
      } else if (confirmationAction === "update") {
        await handleSave();
      } else if (confirmationAction === "delete") {
        await handleDelete(confirmationData);
      }
      toast.success(`Service ${confirmationAction === "delete" ? "deleted" : confirmationAction === "add" ? "added" : "updated"} successfully!`);
    } catch (error) {
      toast.error(`Failed to ${confirmationAction} service: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading
      setShowConfirmationDialog(false); // Close the dialog
    }
  };


// Handler for opening the confirmation dialog
const openConfirmationDialog = (action, data = null) => {
  setConfirmationAction(action);
  setConfirmationData(data);
  setShowConfirmationDialog(true);
};
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "gallery"); // Replace with your Cloudinary upload preset
    
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dntyrf9un/image/upload", formData);
      return response.data.secure_url;
    } catch (error) {
      toast.error("Image upload failed");
      console.error(error);
      return null;
    }
  };
 
  const handleEdit = (service) => {
    setEditingService(service.id);
    setIsEditing(true);
    
    setTitle(service.title);
    setDescription(service.description);
    setInclusions(service.inclusions || []);
    setMainImage(service.mainImage || null);
    setThumbnails(service.thumbnails || [null, null, null]);
  
    // Open modal for editing
    setShowModal(true);
  };
  
  
  // Handle saving an edited service
  const handleSave = async () => {
    if (!editingService) return;
    try {
      await updateDoc(doc(db, "services", editingService), {
        title,
        description,
        inclusions,
        mainImage,
        thumbnails,
      });
      toast.success("Service updated successfully!");
      resetForm();
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "services", id));
      toast.success("Service deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };
  
  const [previewImages, setPreviewImages] = useState([
    "/api/placeholder/400/320",
    "/api/placeholder/100/80",
    "/api/placeholder/100/80",
    "/api/placeholder/100/80"
  ]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);
  
  const handleDrop = async (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
  
    if (file) {
      // Upload the image to Cloudinary (or your preferred service)
      const imageUrl = await uploadImageToCloudinary(file);
  
      if (imageUrl) {
        if (index === "main") {
          setMainImage(imageUrl); // Update mainImage state
        } else {
          setThumbnails((prev) => {
            const newThumbs = [...prev];
            newThumbs[index] = imageUrl; // Update thumbnails state
            return newThumbs;
          });
        }
      }
    }
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (index === "main") {
        setMainImage(imageUrl);
      } else {
        setThumbnails((prev) => {
          const newThumbs = [...prev];
          newThumbs[index] = imageUrl;
          return newThumbs;
        });
      }
    }
  };

  
  const handleMainImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result);
        
        // Update the preview images array
        setPreviewImages((prev) => {
          const newPreviewImages = [...prev];
          newPreviewImages[0] = reader.result;
          return newPreviewImages;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const imageUrl = await uploadImageToCloudinary(file);
    if (!imageUrl) return;

    if (index === 0) {
      setMainImage(imageUrl);
    } else {
      setThumbnails(prev => {
        const newThumbs = [...prev];
        newThumbs[index - 1] = imageUrl;
        return newThumbs;
      });
    }
  };
  
  
  // Handle adding a new service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!title || !description || !mainImage) {
      toast.error("All fields and main image are required");
      return;
    }

    const newService = { title, description, mainImage, thumbnails, inclusions };
    try {
      await addDoc(collection(db, "services"), newService);
      toast.success("Service added successfully!");
      resetForm();
    } catch (error) {
      toast.error("Failed to add service");
      console.error(error);
    }
  };

  const handleAdditionalImageChange = (file, index) => {
    if (!file || !(file instanceof Blob)) {
      console.error("Invalid file:", file);
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnails((prev) => {
        const updatedImages = [...prev];
        updatedImages[index - 1] = reader.result;
        return updatedImages;
      });
  
      setPreviewImages((prev) => {
        const newPreviewImages = [...prev];
        newPreviewImages[index] = reader.result;
        return newPreviewImages;
      });
    };
    reader.readAsDataURL(file);
  };
  
  
  const addInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [serviceToDelete, setServiceToDelete] = useState(null);

  const handleEditService = (service) => {
    setEditingService(true);
  
    // Populate text fields
    setTitle(service.title);
    setDescription(service.description);
    setInclusions(service.inclusions || []);
  
    // Populate image previews
    setMainImage(service.mainImage);
    setThumbnails(service.thumbnails || []);
  
    // Update file input refs (if necessary)
    fileInputRefs.current.forEach((inputRef, index) => {
      if (inputRef && inputRef.current) {
        inputRef.current.value = ""; // Clear previous selections
      }
    });
  };
  

  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMainImage(null);
    setThumbnails([null, null, null]);
    setInclusions([]);
    setEditingService(null);
    setIsEditing(false);
    setShowModal(false);
  };
  
  
  const confirmDeleteService = (id) => {
    setServiceToDelete(id);
    setShowDeleteModal(true);
  };
  
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
  
    try {
      await deleteDoc(doc(db, "services", serviceToDelete));
      toast.success("Service deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };
  
  const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-gray-600 mt-2">{message}</p>
          <div className="mt-4 flex justify-center gap-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600  transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      
      <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-gray-300 pb-2 mb-6">Services</h1>

      <ToastContainer 
        position="bottom-right" 
        toastStyle={{
          backgroundColor: "#181818",
          color: "#fff",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
        hideProgressBar={true} 
        autoClose={3000}
        theme='dark'
      />
      {showDeleteModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-lg font-semibold">Are you sure?</h2>
      <p className="text-gray-600">This action cannot be undone.</p>
      <div className="mt-4 flex justify-center gap-4">
        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
        <button onClick={handleDeleteService} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
      </div>
    </div>
  </div>
)}


<div className="flex flex-col lg:flex-row gap-8 p-6 bg-white">
      {/* Form Section */}
      <div className="w-full lg:w-2/5 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingService ? "Edit Service" : "Add New Service"}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
          <input 
            type="text" 
            placeholder="Service Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Service </label>
          <textarea 
            placeholder="Service Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md h-24"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Main Image</label>
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition">
            <input 
              type="file" 
              ref={fileInputRefs[0]} 
              onChange={(e) => handleImageChange(e, 0)} 
              className="hidden" 
              id="mainImage"
            />
            <label htmlFor="mainImage" className="cursor-pointer flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 text-sm text-gray-600">Click to upload</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Additional Images</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-dashed border-gray-300 rounded-md p-2 text-center cursor-pointer hover:bg-gray-50 transition">
                <input 
                  type="file" 
                  ref={fileInputRefs[i]} 
                  onChange={(e) => handleImageChange(e, i)} 
                  className="hidden" 
                  id={`additionalImage${i}`}
                />
                <label htmlFor={`additionalImage${i}`} className="cursor-pointer flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
            ))}
          </div>
        </div>
        
      
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text" 
              placeholder="Add inclusion" 
              value={newInclusion} 
              onChange={(e) => setNewInclusion(e.target.value)} 
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button 
              onClick={addInclusion} 
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              +
            </button>
          </div>
          <ul className="space-y-2">
            {inclusions.map((inc, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                <span className="text-sm">{inc}</span>
                <button 
                  onClick={() => removeInclusion(index)} 
                  className="text-gray-500 hover:text-black transition"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-4 mt-4">
        <button 
        onClick={isEditing ? () => openConfirmationDialog("update") : () => openConfirmationDialog("add")} 
        className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition font-medium"
      >
        {loading ? "Processing..." : isEditing ? "Update Service" : "Add Service"}
      </button>
  {/* Cancel Button (only visible when editing) */}
  {isEditing && (
    <button 
      onClick={resetForm} 
      className="w-full bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition font-medium"
    >
      Cancel
    </button>
  )}
</div>
      </div>
      
      {/* Preview Section */}
      <div className="flex lg:flex-row gap-6 items-start border-gray-200 shadow-sm border-2 p-4 min-h overflow-hidden w-full lg:w-3/5">
      {/* 📌 Left side: Main Image + Thumbnails */}
      <div className="w-full lg:w-1/2">
        {/* Main Image Upload Box */}
        <div
          className="relative border  overflow-hidden shadow-lg flex items-center justify-center cursor-pointer h-96 bg-gray-100"
          onDrop={(e) => handleDrop(e, "main")}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInputMain").click()}
        >
          {mainImage ? (
            <img src={mainImage} alt="Main preview" className="w-full h-full object-cover" />
          ) : (
            <p className="text-gray-500">Click or Drag an Image Here</p>
          )}
          <input
            type="file"
            id="fileInputMain"
            className="hidden"
            onChange={(e) => handleImageUpload(e, "main")}
          />
        </div>

        {/* 📌 Thumbnails (Below Main Image, Left Aligned) */}
        <div className="flex gap-2 mt-2">
          {thumbnails.map((img, idx) => (
            <div
              key={idx}
              className="relative border overflow-hidden shadow-lg flex items-center justify-center cursor-pointer w-1/3 h-24 bg-gray-100"
              onDrop={(e) => handleDrop(e, idx)}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById(`fileInputThumb${idx}`).click()}
            >
              {img ? (
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-center text-xs">Click or Drag Here</p>
              )}
              <input
                type="file"
                id={`fileInputThumb${idx}`}
                className="hidden"
                onChange={(e) => handleImageUpload(e, idx)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 📌 Right side: Package Details */}
      <div className="w-full lg:w-1/2">
      <h2 className="text-3xl font-bold">{title || "Service Title"}</h2>
      <p className="text-gray-600 mt-2 break-words overflow-hidden text-ellipsis">
  {description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
</p>
<div className="mt-4">
    <h3 className="font-bold">Package Inclusions:</h3>
    <ul className="list-disc list-inside mt-2">
      {inclusions.length > 0 ? (
        inclusions.map((item, index) => (
          <li key={index} className="text-sm text-gray-700">
            {item}
          </li>
        ))
      ) : (
        <li className="text-sm text-gray-500">No inclusions listed.</li>
      )}
    </ul>
  </div>
        {/* Rating */}
        <div className="mt-4 flex items-center">
          <span className="text-sm font-medium mr-2">Rating:</span>
          <div className="flex text-yellow-400 text-lg">★★★★☆</div>
  
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          <button className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold shadow-md">
            Book Now
          </button>
          <button className="w-full bg-white text-black py-3 rounded-lg text-lg font-semibold border border-black shadow-md">
            View Gallery
          </button>
        </div>
      </div>
    </div>
    </div>
      <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-gray-300 pb-2 mt-10 mb-6"></h1>

      <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-gray-300 pb-2 mb-6">Manage Services</h1>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme='dark' />
      <ul className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {services.map((service) => (
    <li key={service.id} className="p-4 border border-gray-300 rounded-lg shadow-lg bg-white">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{service.title}</h2>
        <p className="text-gray-600 mb-2">{service.description}</p>
        <img 
          src={service.mainImage} 
          alt={service.title} 
          className="w-full h-40 object-cover rounded-lg shadow-md mb-3" 
        />
        <div className="flex justify-between mt-3">
          <button 
            onClick={() => handleEdit(service)} 
            className=" bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition font-medium transition"
          >
            Edit
          </button>
          <button 
            onClick={() => openConfirmationDialog("delete", service.id)} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  ))}
</ul>
    </div>
    <ConfirmationDialog
  isOpen={showConfirmationDialog}
  onClose={() => setShowConfirmationDialog(false)}
  onConfirm={handleConfirmAction}
  title="Are you sure?"
  message={
    confirmationAction === "add"
      ? "Are you sure you want to add this service?"
      : confirmationAction === "update"
      ? "Are you sure you want to update this service?"
      : "Are you sure you want to delete this service? This action cannot be undone."
  }
  loading={loading}
/>
    </div>
  );
}

export default AdminServices;
