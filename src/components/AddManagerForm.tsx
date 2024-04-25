import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const AddManagerForm = () => {
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");

  const handleAddManager = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Add a new document with a generated id in the managers collection
      await addDoc(collection(db, "managers"), {
        name: managerName,
        email: managerEmail,
      });
      alert("Manager added successfully");
      // Reset form fields
      setManagerName("");
      setManagerEmail("");
    } catch (error) {
      console.error("Error adding manager:", error);
      alert("Error adding manager");
    }
  };

  return (
    <form onSubmit={handleAddManager}>
      <div>
        <label htmlFor="managerName">Name</label>
        <input
          id="managerName"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="managerEmail">Email</label>
        <input
          id="managerEmail"
          type="email"
          value={managerEmail}
          onChange={(e) => setManagerEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Manager</button>
    </form>
  );
};

export default AddManagerForm;
