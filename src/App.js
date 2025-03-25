import { useState, useEffect } from "react";
import './App.css';
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompactView, setIsCompactView] = useState(false);

  const [newInternship, setNewInternship] = useState({
    name: "",
    company: "",
    status: "",
    link: "",
    deadline: "",
    email: "",
    location: "",
    term: "",
    additionalInfo: "",
  });
  const [editingId, setEditingId] = useState(null);

  const auth = getAuth();

  // Load internships from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "internships"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const internshipsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInternships(internshipsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Sort and filter internships
  useEffect(() => {
    let filtered = internships;

    // Apply search filtering
    if (searchQuery.trim() !== "") {
      filtered = internships.filter((internship) =>
        internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (sortCriteria === "company") {
        return a.company.localeCompare(b.company);
      } else if (sortCriteria === "deadline") {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortCriteria === "status") {
        return a.status.localeCompare(b.status);
      } else if (sortCriteria === "recent") {
        return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
      }
      return 0;
    });

    setFilteredInternships(filtered);
  }, [internships, sortCriteria, searchQuery]);

  // Add or update an internship
  const saveInternship = async () => {
    if (!newInternship.company.trim()) {
      alert("Company Name is required!");
      return;
    }

    try {
      const internshipData = {
        ...newInternship,
        userId: user.uid,
      };
      
      // Add createdAt timestamp only for new entries, not for updates
      if (!editingId) {
        internshipData.createdAt = new Date().toISOString();
      }

      if (editingId) {
        const docRef = doc(db, "internships", editingId);
        await updateDoc(docRef, internshipData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "internships"), internshipData);
      }
      
      // Reset form after successful save
      setNewInternship({
        name: "",
        company: "",
        status: "",
        link: "",
        deadline: "",
        email: "",
        location: "",
        term: "",
        additionalInfo: "",
      });
    } catch (error) {
      console.error("Error saving internship:", error);
      alert("Failed to save internship. Please try again.");
    }
  };

  // Delete an internship
  const deleteInternship = async (id) => {
    try {
      await deleteDoc(doc(db, "internships", id));
    } catch (error) {
      console.error("Error deleting internship:", error);
      alert("Failed to delete internship. Please try again.");
    }
  };

  // Start editing an internship
  const startEditing = (internship) => {
    setNewInternship({
      name: internship.name,
      company: internship.company,
      status: internship.status,
      link: internship.link,
      deadline: internship.deadline,
      email: internship.email,
      location: internship.location,
      term: internship.term,
      additionalInfo: internship.additionalInfo,
    });
    setEditingId(internship.id);
  };

  // Handle logout
  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={(user) => setUser(user)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FLTP Internship Tracker</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <main className="content">
        <section className="form-section">
          <h2 className="centered-heading">{editingId ? "Edit Internship" : "Add New Internship:"}</h2>
          <div className="form-group">
            <label>Internship Role:</label>
            <input
              type="text"
              value={newInternship.name}
              onChange={(e) => setNewInternship({ ...newInternship, name: e.target.value })}
              placeholder="Internship Role"
            />
          </div>
          <div className="form-group">
            <label>Company Name:</label>
            <input
              type="text"
              value={newInternship.company}
              onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })}
              placeholder="Company Name (Required)"
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={newInternship.status}
              onChange={(e) => setNewInternship({ ...newInternship, status: e.target.value })}
            >
              <option value="">Select Status</option>
              <option value="Planning to Apply">Planning to Apply</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>Application Link:</label>
            <input
              type="url"
              value={newInternship.link}
              onChange={(e) => setNewInternship({ ...newInternship, link: e.target.value })}
              placeholder="Application Link"
            />
          </div>
          <div className="form-group">
            <label>Deadline:</label>
            <input
              type="date"
              value={newInternship.deadline}
              onChange={(e) => setNewInternship({ ...newInternship, deadline: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email Used:</label>
            <input
              type="email"
              value={newInternship.email}
              onChange={(e) => setNewInternship({ ...newInternship, email: e.target.value })}
              placeholder="Email Used"
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={newInternship.location}
              onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })}
              placeholder="Location"
            />
          </div>
          <div className="form-group">
            <label>Term:</label>
            <input
              type="text"
              value={newInternship.term}
              onChange={(e) => setNewInternship({ ...newInternship, term: e.target.value })}
              placeholder="Term (e.g., Summer 2024)"
            />
          </div>
          <div className="form-group">
            <label>Additional Info:</label>
            <textarea
              className="additional-info-input"
              value={newInternship.additionalInfo}
              onChange={(e) => setNewInternship({ ...newInternship, additionalInfo: e.target.value })}
              placeholder="Additional Information"
            />
          </div>
          <button className="save-button" onClick={saveInternship}>
            {editingId ? "Update" : "Add"}
          </button>
        </section>
        
        <section className="list-section">
          <h2 className="centered-heading">Internship List:</h2>
          <div className="sort-container">
            <label htmlFor="sort">Sort By:</label>
            <select
              id="sort"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="recent">Recently Added</option>
              <option value="company">Company Name</option>
              <option value="deadline">Deadline Date</option>
              <option value="status">Status</option>
            </select>
            <input
              type="text"
              placeholder="Search Internships"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>
          <button
            className="compact-button"
            onClick={() => setIsCompactView(!isCompactView)}
          >
            {isCompactView ? "Expand View" : "Compact View"}
          </button>
          <ul className="internship-list">
            {filteredInternships.map((internship) => (
              isCompactView ? (
                <li key={internship.id} className="compact-item">
                  <p><strong>Company:</strong> {internship.company}</p>
                  <p><strong>Role:</strong> {internship.name}</p>
                  <p><strong>Status:</strong> {internship.status}</p>
                  <p><strong>Deadline:</strong> {internship.deadline}</p>
                </li>
              ) : (
                <li key={internship.id} className="internship-item">
                  <p><strong>Role:</strong> {internship.name}</p>
                  <p><strong>Company:</strong> {internship.company}</p>
                  <p><strong>Status:</strong> {internship.status}</p>
                  <p>
                    <strong>Application Link:</strong>{" "}
                    <a href={internship.link} target="_blank" rel="noopener noreferrer">
                      {internship.link}
                    </a>
                  </p>
                  <p><strong>Deadline:</strong> {internship.deadline}</p>
                  <p><strong>Email:</strong> {internship.email}</p>
                  <p><strong>Location:</strong> {internship.location}</p>
                  <p><strong>Term:</strong> {internship.term}</p>
                  <p><strong>Additional Info:</strong> {internship.additionalInfo}</p>
                  <button className="delete-button" onClick={() => deleteInternship(internship.id)}>Delete</button>
                  <button className="edit-button" onClick={() => startEditing(internship)}>Edit</button>
                </li>
              )
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;