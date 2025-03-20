import React, { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { getDatabase, ref, push, query, orderByChild, equalTo, get } from 'firebase/database';
import contactImage from "../images/Contact-page/image.png";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    package: '',
    eventDate: '',
    comments: '',
    status: 'pending', // Default status is 'pending'
  });

  const [services, setServices] = useState([]); // State to hold fetched services
  const [bookedDates, setBookedDates] = useState([]); // To store booked dates
  const [isDateDisabled, setIsDateDisabled] = useState(false); // State to control date disabling
  const [isDatePickerFocused, setIsDatePickerFocused] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submissions
  const [contactDetails, setContactDetails] = useState({
    email: '',
    location: '',
    phone: ''
  });

  // Fetch services from Firestore
  useEffect(() => {
    const db = getFirestore();
    const servicesCollection = collection(db, 'services');

    const unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const contactRef = ref(db, 'admin/contact');

    get(contactRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setContactDetails(snapshot.val());
        } else {
          console.log("No contact details available");
        }
      })
      .catch((error) => {
        console.error('Error fetching contact details: ', error);
      });
  }, []);


  // Fetch already booked dates from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'contacts'); // Adjust this path if necessary
    const bookedDatesQuery = query(bookingsRef);

    // Fetch booked dates from Firebase Realtime Database
    get(bookedDatesQuery)
      .then((snapshot) => {
        const bookedDatesArray = [];
        snapshot.forEach((childSnapshot) => {
          // Assuming eventDate is stored as a string in the database
          const eventDate = childSnapshot.val().eventDate;
          if (eventDate) {
            bookedDatesArray.push(new Date(eventDate)); // Convert to Date object
          }
        });

        setBookedDates(bookedDatesArray);
      })
      .catch((error) => console.error('Error fetching booked dates: ', error));
  }, []);

  // Set the package field from the query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedPackage = params.get('package');
    if (selectedPackage) {
      setFormData((prevData) => ({
        ...prevData,
        package: selectedPackage,
      }));
    }
  }, []);

  // Handle date selection
  const handleDateChange = (date) => {
    if (bookedDates.some((booked) => booked.toDateString() === date.toDateString())) {
      alert('This date is already booked. Please choose another date.');
    } else {
      setFormData((prevData) => ({ ...prevData, eventDate: date }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submissions
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true); // Start loading

    // Save form data to Firebase Realtime Database
    const db = getDatabase();
    const formDataRef = ref(db, 'contacts');

    try {
      await push(formDataRef, {
        ...formData,
        eventDate: formData.eventDate ? formData.eventDate.toISOString() : '',
      });

      // Trigger the email via backend after saving booking
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          eventDate: formData.eventDate,
        }),
      });

      if (response.ok) {
        toast.success('Form submitted and email sent successfully!');
      } else {
        toast.error('Form submitted, but email failed to send.');
      }

      // Reset form fields
      setFormData({
        name: '',
        email: '',
        address: '',
        phone: '',
        package: formData.package,
        eventDate: '',
        comments: '',
        status: 'pending',
      });
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('Failed to submit form and send email.');
    } finally {
      setIsSubmitting(false); // Reset submission state
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
    <ToastContainer
      position="bottom-right"
      toastStyle={{
        backgroundColor: "#f8f8f8", // Light grayish-white for minimal look
        color: "#222222", // Soft black for text
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)", // Subtle shadow
        borderRadius: "8px", // Slightly rounded corners for modern feel
      }}
    
      autoClose={3000} // Closes after 3 seconds
    />
     <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}
      </style>
    <div className="bg-white relative">
      <div className="flex justify-end px-5 py-10 relative w-full">
        <div className="max-w-full sm:max-w-[60%] w-full">
          <h1 className="text-xl font-bold leading-tight text-right sm:text-center pr-5" style={{ fontFamily: 'Rozha One' }}>
            We’d love to hear from you! Whether you're looking for high-quality filmmaking services, have questions, or want to collaborate on your next project, we're here to assist.
          </h1>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row justify-center items-start gap-10 px-5 lg:px-10">
        <div className="bg-black text-white w-full lg:w-[780px] h-auto p-6 sm:p-10 rounded-tl-[100px] sm:rounded-tl-[270px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px] shadow-lg relative z-[10] mt-[80px]">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center" style={{ fontFamily: 'Rozha One' }}>
            Book Now!
          </h2>
          <p className="text-center text-gray-300 mt-2 sm:px-10 px-5" style={{ fontFamily: 'Rozha One', fontSize: '20px' }}>
            Feel free to send us your inquiries or project details using the form below, and we'll get back to you as soon as possible!
          </p>

          <form onSubmit={handleSubmit} className="mt-6 font-[Cormorant_Garamond] text-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16">
              <div className="form-field">
                <label className="block mb-2">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-field">
                <label className="block mb-1">Email Address:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="form-field">
                <label className="block mb-1">Personal Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                  placeholder="Enter your address"
                  required
                />
              </div>
              <div className="form-field">
                <label className="block mb-1">Contact Number:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="form-field">
                <label className="block mb-1">Desired Package:</label>
                <select
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                  required
                >
                  <option value="">Select a package</option>
                  {services.map(service => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field w-full">
  <label className="block">Event Date:
 
  </label>
  
 
  <div className="relative w-full">
  <DatePicker
  selected={formData.eventDate}
  onChange={handleDateChange}
  minDate={new Date()} // Prevent past dates
  excludeDates={bookedDates} // Disable booked dates
  dateFormat="yyyy-MM-dd"
  className="w-full p-5 h-15 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F] text-white placeholder-gray-400"
  placeholderText="Select an event date"
  required
  onFocus={() => {
    setIsDatePickerFocused(true);
    toast.warn("Please book at least 7 days before the event date.", {
      position: "top-center",
      autoClose: 3000, // Closes after 3 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  }}
  onBlur={() => setIsDatePickerFocused(false)}
/>
      </div>
      
      
            </div>
</div>
            <div className="form-field mt-4">
              <label className="block mb-1">Additional Comments:</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                style={{ height: "220px" }}
                className="w-full p-5 bg-black border border-white rounded-md focus:outline-none focus:border-[#FEAD5F]"
                placeholder="Enter any additional comments or questions"
              ></textarea>
            </div>

            <div className="mt-10 text-center">
            <button
  type="submit"
  disabled={loading}
  className={`w-full mt-5 py-3 text-white rounded-md text-lg font-bold transition duration-300 ${
    loading ? "opacity-50 cursor-not-allowed bg-[#FEAD5F]" : "bg-[#FEAD5F] hover:bg-[#e69c4f]"
  }`}
  style={{
    backgroundColor: loading ? "#FEAD5F" : "white",
    color: "black",
    fontFamily: "Rozha One",
    fontSize: "20px",
  }}
  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#f7a140")}
  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "white")}
>
  Submit
</button>

            </div>
          </form>
          <script>
        {`
          document.addEventListener("DOMContentLoaded", function () {
            const dateInput = document.querySelector('input[type="date"]');
            if (dateInput) {
              const bookedDates = ${JSON.stringify([...bookedDates])};
              dateInput.addEventListener("input", function (e) {
                if (bookedDates.includes(e.target.value)) {
                  alert("This date is already booked. Please choose another.");
                  e.target.value = "";
                }
              });
            }
          });
        `}
      </script>
        </div>

        <div className="flex flex-col w-full lg:w-auto">
          <div className="relative flex justify-center gap-10 px-5 mb-10">
            <div className="w-full h-full">
              <img src={contactImage} alt="Contact Image" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="contact-info w-full lg:w-auto">
            <div className="bg-white text-black p-7 border-2 border-black shadow-lg h-[450px]">
              <h3 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "Rozha One", fontSize: '35px' }}>
                Contact Information
              </h3>
              <p
                className="text-center text-gray-600 relative top-[-20px]"
                style={{ fontFamily: "Cormorant Garamond", fontSize: '25px' }}
              >
                Say something to start a live chat!
              </p>
              <ul className="mt-6 flex flex-col gap-10" style={{ fontFamily: "Tienne", fontSize: '25px' }}>
                  <li className="flex items-center">
                    <i className="fas fa-phone mr-2 w-5 h-5"></i> {contactDetails.phone}
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-envelope mr-2 w-5 h-5"></i> {contactDetails.email}
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-map-marker-alt mr-2 w-5 h-5"></i> {contactDetails.location}
                  </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
  
}


export default Contact
