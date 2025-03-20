import React, { useEffect, useState } from "react";
import { db } from "../Firebase/Firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from "lucide-react";

function ServiceDetailsModal({ isOpen, onClose, serviceId }) {
  const [service, setService] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [ratingCount, setRatingCount] = useState(0); // State for number of ratings
  const navigate = useNavigate();

  useEffect(() => {
    if (!serviceId) return;

    const fetchServiceDetails = async () => {
      try {
        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setService(data);
          setCurrentImage(data.mainImage); // Set default main image

          // Fetch ratings for this service
          const ratingsCollection = collection(db, "ratings");
          const q = query(ratingsCollection, where("servicePackage", "==", data.title));
          const querySnapshot = await getDocs(q);

          let totalRating = 0;
          let count = 0;

          querySnapshot.forEach((doc) => {
            const ratingData = doc.data();
            totalRating += ratingData.rating;
            count++;
          });

          // Calculate average rating and set states
          const avgRating = count > 0 ? totalRating / count : 0;
          setAverageRating(avgRating);
          setRatingCount(count); // Update rating count
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  if (!isOpen || !service) return null;

  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
  };

  const handleNextImage = () => {
    const images = [service.mainImage, ...(service.thumbnails || [])];
    const currentIndex = images.indexOf(currentImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
    const images = [service.mainImage, ...(service.thumbnails || [])];
    const currentIndex = images.indexOf(currentImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentImage(images[prevIndex]);
  };

  // Function to render stars based on the average rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500 text-2xl">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500 text-2xl">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-2xl">★</span>
        ))}
        <span className="ml-2 text-gray-600 text-lg">({ratingCount} ratings)</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-[95%] max-w-5xl p-8 overflow-auto relative flex flex-col rounded-lg shadow-2xl">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-700 text-4xl hover:text-black transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full h-full mt-6">
          {/* Left Side: Larger Image Section */}
          <div className="w-full lg:w-3/5 flex flex-col items-center">
            {/* Main Image Container with Navigation */}
            <div className="relative border-2 border-gray-200 overflow-hidden shadow-xl flex items-center justify-center cursor-pointer h-[450px] bg-gray-100 w-full max-w-4xl rounded-lg">
              <img src={currentImage} alt="Main preview" className="w-full h-full object-cover" />

              {/* Navigation Buttons Positioned in Bottom Right */}
              <div className="absolute bottom-4 right-4 flex gap-3">
                <button
                    className="bg-white bg-opacity-80 p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all text-gray-600"
                    onClick={handlePrevImage}
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    className="bg-white bg-opacity-80 p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all text-gray-600"
                    onClick={handleNextImage}
                >
                    <ChevronRight size={20} />
                </button>
                </div>  

            </div>

            {/* Thumbnails (Excluding Main Image) */}
            <div className="flex gap-4 mt-6 flex-wrap justify-center">
              {service.thumbnails?.map((thumbnail, index) => (
                <div
                  key={index}
                  className={`border-2 overflow-hidden shadow-md flex items-center justify-center cursor-pointer w-24 h-24 bg-gray-100 rounded-md transition-all hover:shadow-lg ${
                    currentImage === thumbnail ? "ring-2 ring-black scale-105" : ""
                  }`}
                  onClick={() => handleThumbnailClick(thumbnail)}
                >
                  <img src={thumbnail} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Smaller Details Section */}
          <div className="w-full lg:w-2/5 text-center lg:text-left space-y-6 px-4">
            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{service.title}</h2>

            {/* Description */}
            <p className="text-gray-700 text-base lg:text-lg leading-relaxed mb-6 max-w-prose">
              {service.description}
            </p>

            {/* Package Inclusions */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-[#FEAD5F]">Package Inclusions:</h3>
              <ul className="list-disc list-inside mt-3 text-gray-700 space-y-3 pl-2">
                {service.inclusions?.length > 0 ? (
                  service.inclusions.map((item, index) => (
                    <li key={index} className="text-base lg:text-lg">{item}</li>
                  ))
                ) : (
                  <li className="text-base lg:text-lg text-gray-500">No inclusions listed.</li>
                )}
              </ul>
            </div>

            {/* Rating */}
            <div className="mt-8 flex items-center justify-center lg:justify-start">
              <span className="text-lg font-medium mr-3">Rating:</span>
              {renderStars(averageRating)}
            </div>

            {/* Buttons */}
            <div className="mt-10 space-y-4">
              <button
                className="w-full bg-black text-white py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-gray-900 transition-colors"
                onClick={() => navigate(`/contact?package=${encodeURIComponent(service.title)}`)}
              >
                Book Now
              </button>
              
                <button className="w-full bg-white text-black py-4 rounded-lg text-xl font-semibold border-2 border-black shadow-md hover:bg-gray-100 transition-colors"
                 onClick={() => navigate('/gallery')}>
                  View Gallery
                </button>
           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailsModal;