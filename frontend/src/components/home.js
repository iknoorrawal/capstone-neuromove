// // src/Home.js
// import React from "react";
// import { Link } from "react-router-dom";
// import DataFetcherTest from "./testing";
// import { GoogleSignupButton, GoogleLoginButton } from "./google-auth";


// const Home = () => {
//   return (
//     <div>
//       <h1>Welcome to the Homepage</h1>
//       <DataFetcherTest />
//       <button>
//         <Link to="/signup" style={{ textDecoration: "none", color: "white" }}>
//           Go to Signup
//         </Link>
//       </button>
//       <button>
//         <Link to="/login" style={{ textDecoration: "none", color: "white" }}>
//           Go to Login
//         </Link>
//       </button>
//       <div style={{ marginTop: "20px" }}>
//           <GoogleSignupButton /> 
//       </div>
//       <div style={{ marginTop: "20px" }}>
//           <GoogleLoginButton /> 
//       </div>
//     </div>
//   );
// };

// export default Home

import React, { useState } from "react";
import axios from "axios";

const ScriptRunner = ({ numbers }) => {
    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);

    const handleRunScript = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/run-script", numbers);
            setOutput(response.data.output || "Script ran successfully!");
            setError(null); // Clear previous errors
        } catch (err) {
            setError(err.message);
            setOutput(null); // Clear previous outputs
        }
    };

    return (
        <div>
            <p>Memorized numbers: {numbers.number1} and {numbers.number2}</p>
            <button onClick={handleRunScript}>Run Script</button>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {output && <pre>{output}</pre>}
        </div>
    );
};

export default ScriptRunner;
