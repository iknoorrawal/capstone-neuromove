import React, { useEffect, useState } from "react";
import axios from "axios";
import ScriptRunner from "./run-script";

const DataFetcherTest = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showScriptRunner, setShowScriptRunner] = useState(false); // Control when to show ScriptRunner

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/get-number");
                setData(response.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    if (error) return <p>Error: {error}</p>;
    if (!data) return <p>Loading...</p>;

    return (
        <div>
            {!showScriptRunner ? (
                <>
                    <h1>Please memorize these 2 numbers</h1>
                    <p>{data.number1} and {data.number2}</p>
                    <button onClick={() => setShowScriptRunner(true)}>
                        I memorized the numbers
                    </button>
                </>
            ) : (
                // Render ScriptRunner and pass the numbers as props
                <ScriptRunner numbers={data} />
            )}
        </div>
    );
};

export default DataFetcherTest;
