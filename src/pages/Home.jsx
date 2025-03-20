import React, { useEffect, useState } from 'react';
import svgBackground from '../images/Home-page/newBG.svg';
import svgHomeAboutImg from '../images/Home-page/profileimage.png';
import offer1 from '../images/Home-page/offer1.svg';
import offer2 from '../images/Home-page/offer2.svg';
import offer3 from '../images/Home-page/offer3.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import { db } from '../Firebase/Firebase'; // Firebase configuration
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { Dialog } from '@headlessui/react'; // Import Dialog for the rating popup
import toast, { Toaster } from 'react-hot-toast'; // For notifications
import servicesBG from '../images/Home-page/serviceBgto.png';
import { FaStar } from 'react-icons/fa'; // Import star icons from react-icons
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import ServiceDetailsModal from '../components/ServiceDetailsModal';
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { realtimeDb } from '../Firebase/Firebase';

function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false); // State for rating dialog
  const [selectedRating, setSelectedRating] = useState(0); // State for selected rating
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null); // Track selected booking
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]);

  // Define urlParams here
  const urlParams = new URLSearchParams(window.location.search);
  
  useEffect(() => {
    const imagesRef = ref(realtimeDb, "gallery"); // Use correct instance
    onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let allImages = [];
        Object.values(data).forEach((categoryImages) => {
          allImages = [...allImages, ...Object.values(categoryImages)];
        });

        const shuffledImages = allImages.sort(() => 0.5 - Math.random()).slice(0, 10);
        setImages(shuffledImages);
      }
      setLoading(false);
    });
  }, []);
 
  // Split images into two rows
  const firstRowImages = images.slice(0, Math.ceil(images.length / 2));
  const secondRowImages = images.slice(Math.ceil(images.length / 2));

  // Function to scroll the row
  const scrollRow = (rowId, direction) => {
    const row = document.getElementById(rowId);
    if (row) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch services from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const fetchedServices = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedServices = fetchedServices.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setServices(sortedServices.slice(0, 3)); // Changed to display 3 services
      setLoading(false); // Data fetched, stop loading
      
      const urlParams = new URLSearchParams(window.location.search);
      const ratingParam = urlParams.get('rating');

      if (ratingParam === 'true') {
        setIsRatingDialogOpen(true); // Open the rating dialog if the query parameter is present
      }
    });

    return () => unsubscribe();
  }, [window.location.search]);

  // Check for the query parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ratingParam = urlParams.get('rating');

    if (ratingParam === 'true') {
      setIsRatingDialogOpen(true); // Open the rating dialog if the query parameter is present
    }
  }, []);

  // Handle rating submission
  const handleRatingSubmit = async (rating) => {
    const urlParams = new URLSearchParams(window.location.search);
    const servicePackage = selectedBooking?.title || urlParams.get('package');
  
    if (!servicePackage) {
      toast.error('No package selected. Please try again.');
      return;
    }
  
    const db = getFirestore();
    const ratingsCollection = collection(db, 'ratings');
  
    try {
      await addDoc(ratingsCollection, {
        bookingId: selectedBooking?.id || 'N/A', // Use the selected booking ID or a placeholder
        rating: rating,
        servicePackage: servicePackage, // Include the service package
        timestamp: new Date(),
      });
  
      toast.success('Thank you for your rating!');
      setIsRatingDialogOpen(false);
      setSelectedRating(0); // Reset the selected rating
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Error submitting rating');
    }
  };

  return (
    <>
      <Toaster position="bottom-right" /> {/* For notifications */}
      <Dialog open={isRatingDialogOpen} onClose={() => setIsRatingDialogOpen(false)} className="fixed inset-0 flex items-center justify-center p-4 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          <Dialog.Title className="text-lg font-semibold">Rate Your Experience</Dialog.Title>
          <Dialog.Description className="mt-2">
            How would you rate the service you received for{" "}
            <span className="font-bold">{selectedBooking?.title || urlParams.get('package')}</span>?
          </Dialog.Description>
          
          {/* Star Rating Input */}
          <div className="mt-4 flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`text-3xl ${
                  selectedRating >= star ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                onClick={() => setSelectedRating(star)}
              >
                <FaStar /> {/* Star icon from react-icons */}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => handleRatingSubmit(selectedRating)}
            >
              Submit
            </button>
          </div>
        </div>
      </Dialog>

      {/* Section with background image */}
      <section 
        className='h-screen bg-cover bg-center flex justify-start items-start w-full relative px-5 py-20'
        style={{
          backgroundImage: `url(${svgBackground})`,
        }}
      >
        <div className="title w-full ml-4">
          <h1 
            className="text-white mt-96 text-[70px] md:text-[40px] lg:text-[60px] break-words" 
            style={{ 
              fontFamily: 'Rozha One, sans-serif', 
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)' 
            }}
          >
            Transforming Ordinary <br/> Moments Into Extraordinary <br/> Memories.
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="About-me w-full flex" style={{ padding: '50px 0' }}>
        <div className="container mx-auto px-4 flex items-center">
          {/* Left Panel for Image */}
          <div className="left-panel w-full md:w-1/2 pr-4">
            <img 
              src={svgHomeAboutImg} 
              alt="Home About Image" 
              className="mx-auto" 
              style={{ width: '100%', maxWidth: '500px' }} 
            />
          </div>

          {/* Right Panel for Content */}
          <div className="right-panel w-full md:w-1/2 pl-4 pr-4 md:pl-8 md:pr-8">
            <h2 className="text-4xl text-center md:text-left uppercase font-bold" style={{ fontFamily: 'Rozha One, sans-serif' }}>
              About Me
            </h2>
            <p className="mt-6 text-center md:text-left text-lg text-gray-700 font-semibold">
              Norlitz Bato is a Cebu-based filmmaker with over 6 years of experience, specializing in high-quality event shooting and editing. From weddings to corporate projects, he delivers visually stunning and compelling productions.
            </p>

            {/* Align NavLink to the Right */}
            <div className="flex justify-end mt-6">
              <NavLink to="about">
                <div className="text-[#FEAD5F] font-bold py-2 px-6 rounded-lg hover:cursor-pointer" style={{ width: 'fit-content' }}>
                  Read More
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className='p-3 mt-5 '>
        <h2 className="text-4xl text-center p-10 font-semibold  uppercase items-center" style={{ fontFamily: 'Rozha One, sans-serif' }}>
          What I Offer
        </h2>
        <div className="section3-container flex items-center justify-center gap-4 w-full h-72 px-10 mt-9">
          <div className="div1 flex flex-col items-center w-3/12">
            <img src={offer1} alt="" className="w-full h-60 object-cover" />
            <p className="mt-2 font-semibold"
            style={{fontFamily: 'Patua One'}}>Event Videography</p>
          </div>
          <div className="div2 flex flex-col items-center w-4/12">
            <img src={offer2} alt="" className="w-full h-72 object-cover" />
            <p className="mt-2 font-semibold"
            style={{fontFamily: 'Patua One'}}
            >Filmmaking</p>
          </div>
          <div className="div3 flex flex-col items-center w-3/12">
            <img src={offer3} alt="" className="w-full h-60 object-cover" />
            <p className="mt-2 font-semibold"
            style={{fontFamily: 'Patua One'}}>Photography</p>
          </div>
        </div>
      </section>

      {/* Latest Services Section */}
      <section 
        className="text-white py-12 px-4 sm:px-6 md:px-8 bg-cover bg-center bg-no-repeat flex flex-col items-center mt-20"
      >
        <h2 
          className="text-4xl sm:text-5xl font-bold text-center mb-15 uppercase  text-black tracking-widest mt-0"
          style={{ fontFamily: 'Rozha One, sans-serif' }}
        >
          Services
        </h2>
        
        {/* Button to Navigate to Full Services Page */}
        <div className="w-full flex justify-end mb-5">
          <button 
            onClick={() => navigate('/services')}
            className="text-[#FEAD5F] px-6  font-bold hover text-2l :transition duration-300 mr-12"
          >
            See More
          </button>
        </div>

        {loading ? (
          // Animated Loader
          <div className="flex justify-center items-center h-40">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-x-8 gap-y-16 place-items-center px-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="w-11/12 max-w-sm mx-auto flex flex-col justify-between"
              >
                {/* Main Image */}
                <div className="relative w-full h-[300px] mx-auto">
                  <img
                    src={service.mainImage}
                    alt={service.title}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  {/* "Book Now!" Button */}
                  <button
                    className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    onClick={() =>
                      navigate(`/contact?package=${encodeURIComponent(service.title)}`)
                    }
                  >
                    Book Now!
                  </button>
                </div>

                {/* Title & Description */}
                <div className="text-start mt-4">
                  <h3 className="text-lg font-bold text-black">{service.title}</h3>
                  <p className="text-black text-sm mt-2">{service.description}</p>
                </div>
                
                <div className="pt-3 pb-4 text-end mt-auto">
                  <button
                    className="text-[#FEAD5F] font-semibold hover:underline"
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setIsModalOpen(true);
                    }}
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Details Modal */}
        <ServiceDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          serviceId={selectedServiceId}
        />

        <section className="py-20 w-full">
          <h2 
            className="text-4xl sm:text-5xl font-semibold text-center mb-10 uppercase text-black tracking-widest mt-6"
            style={{ fontFamily: 'Rozha One, sans-serif' }}
          >
            Portfolio
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader size={48} className="animate-spin text-gray-700" />
            </div>
          ) : (
            <>
              {/* First Row */}
              <div className="relative mb-4">
                <div className="w-full overflow-hidden">
                  <div
                    id="portfolio-row-1"
                    className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-2 pr-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {firstRowImages.map((image) => (
                      <div
                        key={image.id}
                        className="min-w-[250px] sm:min-w-[300px] flex-shrink-0 snap-start group relative cursor-pointer transform transition-all hover:shadow-xl"
                        style={{ width: "calc(100% / 3.25)" }}
                      >
                        <img
                          src={image.url}
                          alt="Portfolio"
                          className="w-full h-56 sm:h-64 object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 ease-in-out rounded-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Navigation buttons for first row */}
                {firstRowImages.length > 3 && (
                  <>
                    <button
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                      onClick={() => scrollRow("portfolio-row-1", "left")}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                      onClick={() => scrollRow("portfolio-row-1", "right")}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Second Row */}
              {secondRowImages.length > 0 && (
                <div className="relative">
                  <div className="w-full overflow-hidden">
                    <div
                      id="portfolio-row-2"
                      className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-2 pr-4"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {secondRowImages.map((image) => (
                        <div
                          key={image.id}
                          className="min-w-[250px] sm:min-w-[300px] flex-shrink-0 snap-start group relative cursor-pointer transform transition-all hover:shadow-xl"
                          style={{ width: "calc(100% / 3.25)" }}
                        >
                          <img
                            src={image.url}
                            alt="Portfolio"
                            className="w-full h-56 sm:h-64 object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                          />
                          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 ease-in-out rounded-md"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Navigation buttons for second row */}
                  {secondRowImages.length > 3 && (
                    <>
                      <button
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                        onClick={() => scrollRow("portfolio-row-2", "left")}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                        onClick={() => scrollRow("portfolio-row-2", "right")}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
          <div className="w-full flex justify-end mb-5">
            <button 
              onClick={() => navigate('/gallery')}
              className="text-[#FEAD5F]  py-3 font-bold hover text-2l :transition duration-300 mr-12.5"
            >
              See More
            </button>
          </div>
        </section>
      </section>
    </>
  );
}

export default Home;