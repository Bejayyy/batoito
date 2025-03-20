import React, { useEffect, useState } from 'react';
import svgAboutImg from '../images/About-page/about-cover.svg';
import aboutDescription from '../images/About-page/about-description.svg';
import org1 from '../images/About-page/org1.png';
import org2 from '../images/About-page/org2.png';
import org3 from '../images/About-page/org3.png';
import org4 from '../images/About-page/org4.png';
import profile from '../images/About-page/Profile.png';
import { realtimeDb } from '../Firebase/Firebase';
import { ref, onValue } from 'firebase/database';

function About() {
  const [founders, setFounders] = useState([]);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    const foundersRef = ref(realtimeDb, "founders");
    onValue(foundersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const foundersList = Object.entries(data).map(([id, info]) => ({ id, ...info }));
        setFounders(foundersList);
        setShowScrollButtons(foundersList.length > 4);
      }
    });
  }, []);

  const scrollLeft = () => {
    const container = document.querySelector('.organizations');
    container.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = document.querySelector('.organizations');
    container.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <>
      {/* First Section */}
      <section className="relative min-h-screen bg-gray-100">
        <div className="page-1-container flex flex-col lg:flex-row min-h-screen">
          {/* Left Section: Text */}
          <div className="left-page w-full lg:w-[40%] flex justify-center items-center px-4 lg:px-8 mt-12 md:mt-12 lg:mt-0">
            <p 
              className="text-center lg:text-left text-4xl md:text-6xl lg:text-6xl font-serif ml-10" 
              style={{ fontFamily: 'Rozha One, sans-serif' }}
            >
              I CREATE FILMS THAT TELL STORIES, I CAPTURE MOMENTS THAT LAST FOREVER
            </p>
          </div>
          
          {/* Right Section: Image */}
          <div className="right-page w-full lg:w-[60%] flex justify-center items-center mt-12 md:mt-16 lg:mt-0">
            <img 
              src={svgAboutImg} 
              alt="Home About Image" 
              className="w-3/4 md:w-2/3 lg:w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] h-auto"
            />
          </div>
        </div>
      </section>

      {/* Second Section (Description) */}
      <section className="bg-black flex py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:space-x-8 space-y-6 lg:space-y-0">
            {/* Image Section */}
            <div className="w-full lg:w-1/3 flex justify-center">
              <img 
                src={profile} 
                alt="Home About Image" 
                className="max-w-full h-auto rounded-lg" 
                style={{ maxWidth: '400px' }}
              />
            </div>

            {/* Text Section */}
            <div className="w-full lg:w-2/3 text-center lg:text-left">
              <h2 className="text-white text-3xl font-bold mb-4">About Me</h2>
              <p className="text-white text-lg lg:text-xl text-justify">
                Norlitz Bato is a highly skilled filmmaker based in Cebu City, Philippines, with over six years of experience in editing and event shooting. He has built a strong reputation for delivering high-quality, visually striking productions that consistently exceed client expectations. His diverse portfolio includes weddings, debuts, corporate videos, and creative projects, showcasing his versatility and expertise in storytelling. Known for his dedication to his craft and keen attention to detail, Norlitz has earned recognition in the industry and the trust of his clients through his exceptional filmmaking and editing skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section (Founder) */}
      <section className="bg-white min-h-screen py-10">
        <div className="founder-container max-w-7xl mx-auto">
          {/* Title */}
          <p className="text-black text-xl lg:text-4xl font-serif ml-5 lg:ml-10 mt-5 lg:mt-10" style={{ fontFamily: "Rozha One, sans-serif" }}>
            Norlitz Bato is
          </p>
          <p className="text-black text-xl lg:text-4xl font-serif ml-5 lg:ml-10 mt-2 lg:mt-4" style={{ fontFamily: "Rozha One, sans-serif" }}>
            Also the Founder of:
          </p>

          {/* Founders Cards */}
          <div className="relative">
            {showScrollButtons && (
              <button 
                onClick={scrollLeft} 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
              >
                &lt;
              </button>
            )}
            <div className={`organizations ${showScrollButtons ? 'flex overflow-x-auto' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-6 mt-20 px-4 lg:px-0 min-h-[400px] scroll-smooth`}>
              {founders.map((founder) => (
                <div key={founder.id} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                  <div className="img flex justify-center">
                    <img src={founder.image} alt={founder.name} className="w-32 h-32 object-cover rounded-full" />
                  </div>
                  <div className="text mt-4 text-center">
                    <p className="text-gray-800 text-lg font-semibold">
                      {founder.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {showScrollButtons && (
              <button 
                onClick={scrollRight} 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
              >
                &gt;
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;