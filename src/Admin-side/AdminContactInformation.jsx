import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update, remove } from 'firebase/database';

function AdminContactInformation() {
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const db = getDatabase();
  const contactRef = ref(db, 'admin/contact');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const snapshot = await get(contactRef);
        if (snapshot.exists()) {
          setContactInfo(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching contact information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
    if (success) setSuccess(false);
  };

  const saveContactInfo = async () => {
    try {
      setLoading(true);
      await set(contactRef, contactInfo);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving contact information:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async () => {
    try {
      setLoading(true);
      await update(contactRef, contactInfo);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating contact information:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContactInfo = async () => {
    if (window.confirm("Are you sure you want to delete this contact information?")) {
      try {
        setLoading(true);
        await remove(contactRef);
        setContactInfo({ phone: '', email: '', location: '' });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Error deleting contact information:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-black border-b-2 border-black pb-2">Admin Contact Information</h2>
      
      {loading && (
        <div className="flex justify-center my-4">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {success && (
        <div className="bg-black text-white px-4 py-2 rounded-md mb-4 transition-opacity duration-300">
          Action completed successfully!
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            type="text" 
            id="phone"
            name="phone" 
            value={contactInfo.phone} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            className="border-2 border-gray-300 focus:border-black p-2 rounded-md outline-none transition-colors"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={contactInfo.email} 
            onChange={handleChange} 
            placeholder="Email Address" 
            className="border-2 border-gray-300 focus:border-black p-2 rounded-md outline-none transition-colors"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">Location</label>
          <input 
            type="text" 
            id="location"
            name="location" 
            value={contactInfo.location} 
            onChange={handleChange} 
            placeholder="Location" 
            className="border-2 border-gray-300 focus:border-black p-2 rounded-md outline-none transition-colors"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button 
          onClick={saveContactInfo} 
          disabled={loading}
          className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Save
        </button>
        <button 
          onClick={updateContactInfo} 
          disabled={loading}
          className="bg-white text-black border-2 border-black py-2 px-6 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Update
        </button>
        <button 
          onClick={deleteContactInfo} 
          disabled={loading}
          className="bg-white text-black border border-gray-300 py-2 px-6 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default AdminContactInformation;