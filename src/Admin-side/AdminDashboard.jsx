import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [servicesList, setServicesList] = useState([]); // Store all services
  const [servicesFrequency, setServicesFrequency] = useState({});
  
  // Time filter states
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "year", "month", "week"
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const services = await fetchServices();
      fetchBookings(services);
    };

    fetchData();
  }, []);

  // Apply filters when contacts or filter options change
  useEffect(() => {
    applyTimeFilter();
  }, [contacts, timeFilter, selectedYear, selectedMonth, selectedWeek]);

  // Function to get week number from date
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Fetch all services from Firestore
  const fetchServices = async () => {
    const db = getFirestore();
    const servicesRef = collection(db, "services");
    const snapshot = await getDocs(servicesRef);
    const services = snapshot.docs.map((doc) => doc.data().title); // Extract titles
    setServicesList(services);
    return services;
  };

  // Fetch bookings from Firebase Realtime Database
  const fetchBookings = (services) => {
    const db = getDatabase();
    const contactsRef = ref(db, "contacts");
  
    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
  
      const bookings = Object.values(data);
  
      // Extract available years for the filter
      const years = [...new Set(bookings.map(booking => {
        return booking.eventDate ? new Date(booking.eventDate).getFullYear() : null;
      }).filter(year => year !== null))];
  
      setAvailableYears(years.sort());
      setContacts(bookings);
      setFilteredContacts(bookings); // Initialize with all bookings
    });
  };
  

  // Apply time filter to contacts
  const applyTimeFilter = () => {
    let filtered = [...contacts];
  
    if (timeFilter !== "all" && contacts.length > 0) {
      filtered = contacts.filter(contact => {
        if (!contact.eventDate) return false;
  
        const bookingDate = new Date(contact.eventDate);
        const bookingYear = bookingDate.getFullYear();
        const bookingMonth = bookingDate.getMonth();
        const bookingWeek = getWeekNumber(bookingDate);
  
        if (timeFilter === "year") {
          return bookingYear === selectedYear;
        } else if (timeFilter === "month") {
          return bookingYear === selectedYear && bookingMonth === selectedMonth;
        }
  
        return true;
      });
    }
  
    setFilteredContacts(filtered);
    updateServiceFrequency(filtered, servicesList);
  };
  
  // Update services frequency ensuring all services are displayed
  const updateServiceFrequency = (bookings, services) => {
    const frequency = {};

    // Initialize all services with zero bookings
    services.forEach((service) => {
      frequency[service] = 0;
    });

    // Count bookings for each service
    bookings.forEach((contact) => {
      const service = contact.package; // Assuming 'package' is the service title
      if (service && frequency.hasOwnProperty(service)) {
        frequency[service]++;
      }
    });

    setServicesFrequency(frequency);
  };

  // Prepare chart data
  const chartData = {
    labels: Object.keys(servicesFrequency),
    datasets: [
      {
        label: "Bookings by Service",
        data: Object.values(servicesFrequency),
        backgroundColor: "#181818",
        borderColor: "#181818",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#181818",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "#181818",
        bodyColor: "#FFFFFF",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#181818",
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#181818",
          beginAtZero: true,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  // Generate month names array
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate weeks array (1-52)
  const weeksArray = Array.from({ length: 52 }, (_, i) => i + 1);

  // Total Bookings Data based on filtered contacts
  const totalBookings = filteredContacts.length;
  const pendingBookings = filteredContacts.filter((contact) => contact.status === "pending").length;
  const confirmedBookings = filteredContacts.filter((contact) => contact.status === "confirmed").length;

  // Get filter period label for display
  const getFilterPeriodLabel = () => {
    if (timeFilter === "all") return "All Time";
    if (timeFilter === "year") return `Year ${selectedYear}`;
    if (timeFilter === "month") return `${monthNames[selectedMonth]} ${selectedYear}`;
    if (timeFilter === "week") return `Week ${selectedWeek}, ${selectedYear}`;
    return "";
  };

  return (
    <div className="space-y-6 mt-10 lg:mt-0">
      <h1 className="text-3xl font-bold text-gray-800 border-b-4 border-gray-300 pb-2">
        Admin Dashboard
      </h1>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black p-6 rounded-lg shadow-md flex">
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Total Bookings</h2>
              <p className="text-4xl font-bold text-white">{totalBookings}</p>
              <p className="text-sm text-gray-300 mt-2">{getFilterPeriodLabel()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black p-6 rounded-lg shadow-md flex">
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Pending Bookings</h2>
              <p className="text-4xl font-bold text-white">{pendingBookings}</p>
              <p className="text-sm text-gray-300 mt-2">{getFilterPeriodLabel()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black p-6 rounded-lg shadow-md flex">
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Confirmed Bookings</h2>
              <p className="text-4xl font-bold text-white">{confirmedBookings}</p>
              <p className="text-sm text-gray-300 mt-2">{getFilterPeriodLabel()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Time Period Filter Controls */}
      <div className="flex justify-end mb-4 mr-5">
  <div className="flex space-x-4 bg-white p-3 rounded-lg shadow-md border border-gray-300">
    <div className="flex flex-col">
      <label className="text-black text-sm mb-1">Filter By</label>
      <select 
        value={timeFilter} 
        onChange={(e) => setTimeFilter(e.target.value)} 
        className="p-2 bg-white text-black border border-gray-400 rounded"
      >
        <option value="all">All Time</option>
        <option value="year">Year</option>
        <option value="month">Month</option>
      </select>
    </div>

    {timeFilter === "year" && (
      <div className="flex flex-col">
        <label className="text-black text-sm mb-1">Select Year</label>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
          className="p-2 bg-white text-black border border-gray-400 rounded"
        >
          {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>
    )}

    {timeFilter === "month" && (
      <div className="flex flex-col">
        <label className="text-black text-sm mb-1">Select Month</label>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
          className="p-2 bg-white text-black border border-gray-400 rounded"
        >
          {[...Array(12).keys()].map(month => 
            <option key={month} value={month}>
              {new Date(0, month).toLocaleString('default', { month: 'long' })}
            </option>
          )}
        </select>
      </div>
    )}
  </div>
</div>




      {/* Booking Services Bar Chart */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bookings by Service - {getFilterPeriodLabel()}
        </h2>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AdminDashboard;