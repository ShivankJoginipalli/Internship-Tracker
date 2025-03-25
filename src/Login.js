import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import './App.css'; // Add your styling here

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate inputs
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!email.includes("@")) {
      setError("Invalid email format.");
      return;
    }
  
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(auth.currentUser); // Pass logged-in user to parent
    } catch (err) {
      console.log("Error Code:", err.code); // Log error code
      console.log("Error Message:", err.message); // Log error message
  
      // Handle specific Firebase error codes
      switch (err.code) {
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email. Please register first.");
          break;
        case "auth/invalid-email":
          setError("The email address is invalid.");
          break;
        case "auth/invalid-credential":
          setError("Invalid credentials. Please check your email and password and try again.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already in use. Please login instead.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please use at least 6 characters.");
          break;
        default:
          setError("An unknown error occurred. Please try again.");
          break;
      }
    }
  };
  

  return (
    <div className="login-container">
      <header className="tracker-header">
        <h1>FLTP Internship Tracker</h1>
      </header>
      <div className="login-box">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} className="switch-button">
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default Login;