import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner/LoadingSpinner";

import {useHttpClient} from "../../shared/hooks/http-hook";

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState();
    const {isLoading, error, sendRequest, clearError} = useHttpClient();

    const userId = useParams().userId;

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(`/api/places/user/${userId}`);
                setLoadedPlaces(responseData.places);
            } catch (error) {

            }
        }
        fetchPlaces();
    }, [sendRequest, userId]);

    const placeDeletedHandler = (deletedPlaceId) => {
        setLoadedPlaces(prevPlaces =>
            prevPlaces.filter(place => place.id !== deletedPlaceId)
        )
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onCancel={clearError}/>
            {isLoading && <LoadingSpinner asOverlay/>}
            {!isLoading && loadedPlaces && <PlaceList places={loadedPlaces} onDeletePlace={placeDeletedHandler}/>}
        </React.Fragment>
    );
};

export default UserPlaces;