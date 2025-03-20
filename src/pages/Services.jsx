import React, { useEffect, useState } from 'react';
import { db } from '../Firebase/Firebase'; // Firebase configuration
import { collection, onSnapshot } from 'firebase/firestore';
import ServiceDetailsModal from "../components/ServiceDetailsModal"

// Import the landing image from the correct path
import landingImage from '../images/Services-page/cute.png';
import { Navigate, useNavigate } from 'react-router-dom';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const navigate = useNavigate(); // Call the useNavigate hook here
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  
  // Fetch services from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false); // Data fetched, stop loading
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
     <section 
  className="h-[90vh] bg-cover bg-center flex justify-end items-center w-full relative overflow-hidden"
  style={{
    backgroundImage: `url(${landingImage})`
  }}
>
  {/* Right Section: Text */}
  <div className="sm:p-8 flex flex-col justify-center items-end text-right h-full w-[50%]">
  <div className="max-w-lg">
    <h1 
      className="text-3xl sm:text-4xl font-bold text-white"
      style={{ 
        fontFamily: 'Orelega One', 
        textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)' // Dark shadow for depth
      }}
    >
      I PROVIDE PROFESSIONAL FILMMAKING SERVICES <br />
      I DELIVER QUALITY IN EVERY PROJECT
    </h1>
    <p 
      className="text-base sm:text-lg text-white mt-4 sm:mt-6 font-semibold"
      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }} // Subtle shadow
    >
      From film production to event coverage, my services are tailored to meet your unique needs. Whether it's capturing life's precious moments, crafting cinematic content, or producing polished corporate videos, I'm dedicated to bringing your vision to life.
    </p>
    <p 
      className="text-base sm:text-lg text-white mt-4 sm:mt-6 font-semibold"
      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
    >
      Let's bring your vision to life.
    </p>
  </div>
</div>

</section>

      
<section className="py-12 px-8">
        <h2 className="text-3xl font-bold text-center mb-12 uppercase">
          Services
        </h2>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="mx-auto flex flex-col justify-between h-full w-11/12"
            >
              {/* Main Image */}
              <div className="relative w-full h-[350px]">
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
                <h3 className="text-lg font-bold">{service.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{service.description}</p>
              </div>

              {/* "See Details" Button */}
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
      </section>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceId={selectedServiceId}
      />

    </>
  );
}

export default Services;