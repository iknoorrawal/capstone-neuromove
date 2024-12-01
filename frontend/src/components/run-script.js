import React, { useState } from "react";
import axios from "axios";

const ScriptRunner = ({ numbers }) => {
    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);

    const handleRunScript = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/run-script", {
                number1: numbers.number1,
                number2: numbers.number2,
            });
            setOutput(response.data.output || "Script ran successfully!");
        } catch (err) {
            setError(err.message);
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
