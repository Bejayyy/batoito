import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import galleryBg from '../images/About-page/galleryBg.svg'

function Gallery() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const db = getDatabase();

  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.entries(data).map(([id, name]) => ({ id, name })) : []);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    categories.forEach((category) => {
      const imagesRef = ref(db, `gallery/${category.id}`);
      onValue(imagesRef, (snapshot) => {
        const data = snapshot.val();
        setImages((prevImages) => ({
          ...prevImages,
          [category.id]: data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [],
        }));
      });
    });
  }, [db, categories]);

  // Function to scroll the row
  const scrollRow = (rowId, direction) => {
    const row = document.getElementById(rowId);
    if (row) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    
    <div className=" bg-gray-100  text-black">
      <section 
  className="h-[60vh] bg-cover bg-center flex justify-start items-center w-full relative px-5 py-20 overflow-hidden"
  style={{
    backgroundImage: `url(${galleryBg})`,
    backgroundAttachment: 'fixed', // Keeps the background stable
  }}
>
  <div className="title w-full ml-4 text-center flex items-center justify-center h-ful ">
    <h1 
      className="text-white text-[10px] md:text-[20px] lg:text-[50px] break-words max-w-[80%] overflow-hidden " 
      style={{ 
        fontFamily: 'Rozha One, sans-serif', 
        textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
        whiteSpace: 'normal'
      }}
    >
      Explore Norlitz Bato's portfolio and discover the artistry behind every unforgettable moment
    </h1>
  </div>
</section>


      {/* Loader */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader size={48} className="animate-spin text-gray-700" />
        </div>
      )}

      {/* Gallery Categories */}
      {categories.map((category) => {
        const categoryImages = images[category.id] || [];

        // Split images into first and second row
        const firstRowImages = categoryImages.slice(0, Math.ceil(categoryImages.length / 2));
        const secondRowImages = categoryImages.slice(Math.ceil(categoryImages.length / 2));

        return (
          <div key={category.id} className="mb-10 mt-10">
            <h2 className="text-2xl sm:text-4xl font-bold mb-10 ml-4 text-gray-800"style={{ fontFamily: 'Orelega One' }}
            >{category.name}</h2>

            {/* First Row - With partial 4th image visible */}
            <div className="mb-4 relative">
              <div className="w-full relative overflow-hidden">
                <div
                  id={`row1-${category.id}`}
                  className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-2 pr-4"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {firstRowImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="min-w-[250px] sm:min-w-[300px] flex-shrink-0 snap-start group relative cursor-pointer transform transition-all hover:shadow-xl"
                      style={{
                        width: 'calc(100% / 3.25)', // Make the width of each card exactly 1/3.25 of the container width
                      }}
                    >
                      <img
                        src={image.url}
                        alt="Gallery"
                        className="w-full h-56 sm:h-64 object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 ease-in-out rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Navigation arrows for first row */}
              {firstRowImages.length > 3 && (
                <>
                  <button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                    onClick={() => scrollRow(`row1-${category.id}`, 'left')}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                    onClick={() => scrollRow(`row1-${category.id}`, 'right')}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Second Row - With partial 4th image visible */}
            {secondRowImages.length > 0 && (
              <div className="relative">
                <div className="w-full relative overflow-hidden">
                  <div
                    id={`row2-${category.id}`}
                    className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-2 pr-4"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {secondRowImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="min-w-[250px] sm:min-w-[300px] flex-shrink-0 snap-start group relative cursor-pointer transform transition-all hover:shadow-xl"
                        style={{
                          width: 'calc(100% / 3.25)', // Make the width of each card exactly 1/3.25 of the container width
                        }}
                      >
                        <img
                          src={image.url}
                          alt="Gallery"
                          className="w-full h-56 sm:h-64 object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 ease-in-out rounded-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Navigation arrows for second row */}
                {secondRowImages.length > 3 && (
                  <>
                    <button
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                      onClick={() => scrollRow(`row2-${category.id}`, 'left')}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-70 hidden sm:flex z-10"
                      onClick={() => scrollRow(`row2-${category.id}`, 'right')}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Gallery;
