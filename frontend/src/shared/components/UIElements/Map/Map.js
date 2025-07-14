import React, { useEffect, useRef } from 'react';
import './Map.css';

const Map = props => {
    const mapRef = useRef();
    const { center, zoom } = props;

    useEffect(() => {
        // If the Maps script is already loaded, skip
        if (window.google && window.google.maps) {
            initMap();
            return;
        }

        // Otherwise, create script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.onload = initMap;

        document.body.appendChild(script);

        function initMap() {
            const map = new window.google.maps.Map(mapRef.current, {
                center: center,
                zoom: zoom
            });
            new window.google.maps.Marker({ position: center, map: map });
        }

        return () => {
            // cleanup: remove script if needed
            document.body.removeChild(script);
        };
    }, [center, zoom]);

    return (
        <div
            ref={mapRef}
            className={`map ${props.className}`}
            style={props.style}
        ></div>
    );
};

export default Map;
