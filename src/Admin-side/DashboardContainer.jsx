import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import AdminDashboard from './AdminDashboard';
import Bookings from './Bookings';

const DashboardContainer = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const contactsRef = ref(db, 'contacts');

    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedData = [];
      for (let key in data) {
        formattedData.push({ ...data[key], id: key });
      }
      setContacts(formattedData);
    });
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === id ? { ...contact, status: newStatus } : contact
    );
    setContacts(updatedContacts); // Update state with the new status
  };

  return (
    <div>
      <AdminDashboard contacts={contacts} />
      <Bookings contacts={contacts} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default DashboardContainer;
