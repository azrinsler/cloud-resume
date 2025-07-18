import * as React from "react";
import {useEffect, useState} from "react";


const Browse : () => React.JSX.Element = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState();

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            fetch("https://api.azrinsler.com/RecipeLambda", {
                signal: AbortSignal.timeout(120 * 1000),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "https://api.azrinsler.com/RecipeLambda"
                },
                body: JSON.stringify({ "operation":"getRecipes" })
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((jsonData) => {
                if (jsonData != null) {
                    console.log(jsonData);
                    setData(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [data, loading] );

    return error ? <span>{error}</span> : loading ? <>Loading</> : <div>{data}</div>
}
export default Browse