import {useCallback, useEffect, useRef, useState} from "react";

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([]);
    const BASE_URL = process.env.REACT_APP_BACKEND_URL;

    const sendRequest = useCallback(async (endpoint, method = 'GET', body = null, headers = {}) => {
        setIsLoading(true);
        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);

        const url = `${BASE_URL}${endpoint}`;
        console.log(url)
        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal
            });

            const responseData = await response.json()

            activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl);

            if (!response.ok) {
                throw new Error(responseData.message);
            }
            setIsLoading(false);
            return responseData;
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
            setIsLoading(false);
            throw err;
        }
    }, [BASE_URL])

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
        };
    }, []);
    return {isLoading, error, sendRequest, clearError};
}