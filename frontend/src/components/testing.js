import React, { useEffect, useState } from "react";
import axios from "axios";

const DataFetcherTest = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/testing");
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
        <h1>{data.message}</h1>
        </div>
    );
};

export default DataFetcherTest;