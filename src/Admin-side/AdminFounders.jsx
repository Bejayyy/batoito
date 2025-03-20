import React, { useState, useEffect } from "react";
import { realtimeDb } from "../Firebase/Firebase";
import { ref, push, onValue, remove, update } from "firebase/database";
import axios from "axios";
import { toast } from "react-toastify";

const AdminFounders = () => {
  const [founderName, setFounderName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [founders, setFounders] = useState([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [editingFounder, setEditingFounder] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const foundersRef = ref(realtimeDb, "founders");
    onValue(foundersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFounders(Object.entries(data).map(([id, info]) => ({ id, ...info })));
      }
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!founderName || !description || !image) {
      toast.error("All fields are required!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "gallery");
      const response = await axios.post("https://api.cloudinary.com/v1_1/dntyrf9un/image/upload", formData);
      const imageUrl = response.data.secure_url;

      const foundersRef = ref(realtimeDb, "founders");
      if (editingFounder) {
        await update(ref(realtimeDb, `founders/${editingFounder.id}`), {
          name: founderName,
          description,
          image: imageUrl,
        });
        toast.success("Founder updated successfully!");
      } else {
        await push(foundersRef, {
          name: founderName,
          description,
          image: imageUrl,
        });
        toast.success("Founder added successfully!");
      }
      resetForm();
    } catch (error) {
      toast.error("Upload failed");
    }
    setShowConfirmationDialog(false);
  };

  const resetForm = () => {
    setFounderName("");
    setDescription("");
    setImage(null);
    setPreviewImage(null);
    setEditingFounder(null);
  };

  const handleDelete = (id) => {
    setShowConfirmationDialog(true);
    setConfirmAction(() => async () => {
      await remove(ref(realtimeDb, `founders/${id}`));
      toast.success("Founder deleted successfully!");
      setShowConfirmationDialog(false);
    });
  };

  const handleEdit = (founder) => {
    setFounderName(founder.name);
    setDescription(founder.description);
    setPreviewImage(founder.image);
    setEditingFounder(founder);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Founders</h2>
      <div className="flex gap-6">
        {/* Form Section (Left Side) */}
        <div className="w-1/2">
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Founder Name"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmationDialog(true)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                {editingFounder ? "Update Founder" : "Add Founder"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section (Right Side) */}
        <div className="w-1/2">
          <div className="p-4 border rounded">
            <h3 className="text-lg font-bold mb-2">Preview</h3>
            <div className="flex flex-col items-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-40 rounded shadow"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 rounded shadow flex items-center justify-center">
                  <p className="text-gray-500">No image selected</p>
                </div>
              )}
              <p className="mt-2 text-center font-semibold">{founderName}</p>
              <p className="text-gray-600 text-sm text-center">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmationDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
            <p>Do you really want to {editingFounder ? "update" : "add"} this founder?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowConfirmationDialog(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Founders List */}
      <ul className="mt-6 space-y-4">
        {founders.map((founder) => (
          <li key={founder.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold">{founder.name}</h3>
              <p>{founder.description}</p>
              <img src={founder.image} alt={founder.name} className="mt-2 w-40" />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(founder)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(founder.id)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFounders;