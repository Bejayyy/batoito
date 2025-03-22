import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { Dialog } from '@headlessui/react'; // ✅ Import Dialog from headlessui
import toast, { Toaster } from 'react-hot-toast'; // ✅ Import Toaster for notifications
import { getFirestore, collection, onSnapshot } from "firebase/firestore";


const Bookings = () => {
  const [formData, setFormData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending'); // ✅ Default to 'pending'
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ✅ State for dialog visibility
  const [selectedBooking, setSelectedBooking] = useState(null); // ✅ Store selected booking
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // ✅ State for delete confirmation dialog
  const [deleteId, setDeleteId] = useState(null); // ✅ Store ID for deletion
  const [categoryFilter, setCategoryFilter] = useState('all'); // Default to 'all'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const itemsPerPage = 5;
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);


   // Fetch categories from Firestore
   useEffect(() => {
    const db = getFirestore();
    const servicesCollection = collection(db, 'services');
  
    const unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => doc.data().title);
      console.log("Fetched categories:", categoriesData); // Debugging line
      setCategories([...new Set(categoriesData)]); // Remove duplicates
    });
  
    return () => unsubscribe();
  }, []);
  

   // Fetch bookings from Firebase Realtime Database (Single Fetch)
   useEffect(() => {
    const db = getDatabase();
    const formDataRef = ref(db, 'contacts');

    const unsubscribe = onValue(formDataRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setFormData([]);
        setFilteredData([]);
        return;
      }
      
      const formattedData = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));

      setFormData(formattedData);
    });

    return () => unsubscribe();
  }, []);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'latest' ? 'oldest' : 'latest'));
  };
  // Apply filters whenever formData, filters, or searchQuery changes
  useEffect(() => {
    let filtered = [...formData];

    // Default to pending if no filter is applied
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.package === categoryFilter);
    }

    if (selectedMonth || selectedYear) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.eventDate);
        return (
          (selectedMonth ? itemDate.getMonth() + 1 === parseInt(selectedMonth) : true) &&
          (selectedYear ? itemDate.getFullYear() === parseInt(selectedYear) : true)
        );
      });
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ✅ Sort based on selected order
    // ✅ Sort by nearest upcoming event date
    filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      const now = new Date();
      return (dateA - now) - (dateB - now);
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [formData, statusFilter, categoryFilter, selectedMonth, selectedYear, searchQuery,sortOrder]);
// Fetch bookings from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const formDataRef = ref(db, 'contacts');

    onValue(formDataRef, (snapshot) => {
      const data = snapshot.val();
      const formattedData = Object.keys(data || {}).map((key) => ({
        ...data[key],
        id: key,
      }));

      setFormData(formattedData);
      applyFilters(formattedData);
    });
  }, [statusFilter, categoryFilter, selectedMonth, selectedYear]);

 // Apply filters
 // Apply filters
 const applyFilters = (data) => {
  let filtered = data;

  if (categoryFilter === 'all' && selectedMonth === '' && selectedYear === '') {
    setFilteredData(data);
    return;
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter((item) => item.status === statusFilter);
  }

  if (categoryFilter !== 'all') {
    filtered = filtered.filter((item) => item.package === categoryFilter);
  }

  if (selectedMonth !== '' || selectedYear !== '') {
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.eventDate);
      return (
        (selectedMonth === '' || itemDate.getMonth() + 1 === parseInt(selectedMonth)) &&
        (selectedYear === '' || itemDate.getFullYear() === parseInt(selectedYear))
      );
    });
  }

  setFilteredData(filtered);
};
  // Fetch data from Firebase
  

  // Function to filter bookings by status
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredData(formData);
    } else {
      const filtered = formData.filter((data) => data.status === status);
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  };


  // Function to update status in Firebase
const handleStatusChange = (id, newStatus) => {
  setSelectedBooking({ id, newStatus }); // Ensure newStatus is passed correctly
  setIsDialogOpen(true);
};

  // Confirm status change and send email
  const confirmStatusChange = () => {
    if (!selectedBooking) return;
  
    const { id, newStatus } = selectedBooking;
    console.log("Selected Booking:", selectedBooking); // Debugging
    console.log("New Status:", newStatus); // Debugging
  
    const db = getDatabase();
    const statusRef = ref(db, `contacts/${id}`);
  
    const user = formData.find((data) => data.id === id);
    const { name, email, package: servicePackage } = user; // Include the package/service title
  
    update(statusRef, { status: newStatus })
      .then(() => {
        setFilteredData(
          filteredData.map((data) =>
            data.id === id ? { ...data, status: newStatus } : data
          )
        );
  
        toast.success(`Booking status changed to ${newStatus}`);
  
        // Send email with rating link and service details
        fetch('http://localhost:3000/send-status-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            status: newStatus,
            package: servicePackage, // Include the package/service title
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              toast.success('Status update email sent successfully!');
            }
          })
          .catch((error) => {
            console.error("Error sending status email:", error); // Debugging
            toast.error('Error sending status email.');
          });
      })
      .catch((error) => {
        console.error("Error updating status:", error); // Debugging
        toast.error('Error updating status');
      });
  
    setIsDialogOpen(false);
    setSelectedBooking(null);
  };
const handleRatingSubmit = async (rating) => {
  if (!selectedBooking) return;
  const { id } = selectedBooking;
  const db = getFirestore();
  const ratingsCollection = collection(db, 'ratings');

  try {
    await addDoc(ratingsCollection, {
      bookingId: id,
      rating: rating,
      timestamp: new Date(),
    });
    toast.success('Thank you for your rating!');
    setIsRatingDialogOpen(false);
  } catch (error) {
    toast.error('Error submitting rating');
  }
};

  // Function to remove a booking
  const handleRemoveBooking = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

   // Function to confirm deletion
   const confirmDelete = () => {
    const db = getDatabase();
    const bookingRef = ref(db, 'contacts/' + deleteId);

    remove(bookingRef)
        .then(() => {
            const updatedData = filteredData.filter((data) => data.id !== deleteId);
            setFilteredData(updatedData);
            setFormData(updatedData);
            toast.success('Booking deleted successfully!');
        })
        .catch((error) => {
            console.error('Error removing booking:', error);
            toast.error('Failed to delete booking');
        });

    setIsDeleteDialogOpen(false);
};

  // Function to handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = formData.filter(
      (data) =>
        data.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        data.email.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Format event date
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const parsedDate = Date.parse(dateString);
    if (isNaN(parsedDate)) return "Invalid Date";
    return new Date(parsedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 lg:mt-0 mt-10">
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

      <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-gray-300 pb-2">Bookings</h1>
      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="fixed inset-0 flex items-center justify-center p-4 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Confirm Status Change</Dialog.Title>
          <Dialog.Description className="mt-2">Are you sure you want to change the status?</Dialog.Description>
          <div className="mt-4 flex justify-end space-x-2">
            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsDialogOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-black text-white rounded-md" onClick={confirmStatusChange}>Confirm</button>

          </div>
        </div>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} className="fixed inset-0 flex items-center justify-center p-4 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Confirm Deletion</Dialog.Title>
          <Dialog.Description className="mt-2">Are you sure you want to delete this booking?</Dialog.Description>
          <div className="mt-4 flex justify-end space-x-2">
            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-black text-white rounded-md" onClick={confirmDelete}>Confirm</button>
          </div>
        </div>
      </Dialog>
      {/* Search Bar & Status Filter Buttons */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Name or Email"
          className="p-2 border border-gray-400 text-black rounded-lg focus:outline-none focus:border-[#000000] w-1/3"
          value={searchQuery}
          onChange={handleSearch}
        />

          {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        
        {/* Status Filter */}
        <select className="p-2 border rounded-lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        
        </select>

        {/* Category Filter */}
        <select
        className="p-2 border rounded-lg" 
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            console.log("Selected Category:", e.target.value); // Debugging
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>     
        {/* Date Filters */}
        <select className="p-2 border rounded-lg" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select className="p-2 border rounded-lg" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All Years</option>
          {[...Array(6)].map((_, i) => (
            <option key={i} value={new Date().getFullYear() + 1 - i}>
              {new Date().getFullYear() + 1 - i}
            </option>
          ))}
        </select>

      </div>
      </div>

      {/* Table */}
      <div className="flex flex-col h-[65vh] bg-white shadow-md rounded-lg overflow-hidden">

      <table className="min-w-full flex-1 overflow-auto">

          <thead className="bg-black text-white">
            <tr>
              {['name', 'email', 'phone', 'package', 'eventDate', 'comments', 'status'].map((col) => (
                <th key={col} className="py-3 px-6 text-left">{col.charAt(0).toUpperCase() + col.slice(1)}</th>
              ))}
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((data, index) => (
              <tr key={data.id} className="hover:bg-gray-200 relative">
                <td className="py-3 px-6 overflow-visible" >{data.name}</td>
                <td className="py-3 px-6 overflow-visible">{data.email}</td>
                <td className="py-3 px-6 overflow-visible">{data.phone}</td>
                <td className="py-3 px-6 overflow-visible">{data.package}</td>
                <td className="py-3 px-6 overflow-visible">{formatDate(data.eventDate)}</td>
                <td className="py-3 px-6 overflow-visible">{data.comments}</td>
                <td className="py-3 px-6 overflow-visible">{data.status}</td>
                <td className="py-3 px-6 relative overflow-visible">
  <div 
    className="relative inline-block"
    onMouseEnter={() => setDropdownVisible(index)}
    onMouseLeave={() => setDropdownVisible(null)}
  >
    <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">
      Actions
    </button>

    {dropdownVisible === index && (
      <div 
        className="absolute right-0 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
        onMouseEnter={() => setDropdownVisible(index)}
        onMouseLeave={() => setDropdownVisible(null)}
        style={{ 
          bottom: index >= currentItems.length - 1 ? "100%" : "auto", // Flip dropdown up if at bottom
          top: index >= currentItems.length - 1 ? "auto" : "100%", // Prevent going off-screen
        }}
      >
        <div className="py-1">
          
          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => handleStatusChange(data.id, 'confirmed')}>
            Confirm
          </button>
          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => handleStatusChange(data.id, 'completed')}>
            Complete
          </button>
          
          <button
                            className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                            onClick={() => handleRemoveBooking(data.id)}
                          >
                            Delete
                          </button>


        </div>
      </div>
    )}
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
          <div className="flex justify-center py-4">
            <button
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-600"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="px-4 py-2 text-black">
              Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
            </span>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-600"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onClose={() => setIsRatingDialogOpen(false)} className="fixed inset-0 flex items-center justify-center p-4 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Rate Your Experience</Dialog.Title>
          <Dialog.Description className="mt-2">How would you rate the service you received?</Dialog.Description>
          <div className="mt-4 flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`px-4 py-2 rounded-md ${selectedRating >= star ? 'bg-yellow-400' : 'bg-gray-300'}`}
                onClick={() => setSelectedRating(star)}
              >
                {star} Star
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsRatingDialogOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-black text-white rounded-md" onClick={() => handleRatingSubmit(selectedRating)}>Submit</button>
          </div>
        </div>
      </Dialog>

        </div>
    
    );
  };

export default Bookings;
