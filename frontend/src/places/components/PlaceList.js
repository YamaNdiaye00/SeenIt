import React from 'react';

import Card from "../../shared/components/UIElements/Card/Card";
import './PlaceList.css'
import PlaceItem from "./PlaceItem";

const PlaceList = ({places, onDeletePlace}) => {
    if (!places || !places.length) {
        return (
            <div className="place-list center">
                <Card>
                    <h2>
                        No places found. Maybe create one?
                        {/*<button>Share Place</button>*/}
                    </h2>
                </Card>
            </div>
        );
    }

    return (
        <ul className="place-list">
            {places.map((place) => (
                <PlaceItem
                    key={place.id}
                    id={place.id}
                    image={place.image}
                    title={place.title}
                    description={place.description}
                    address={place.address}
                    creatorId={place.creator}
                    coordinates={place.location}
                    onDelete={onDeletePlace}
                />
            ))}
        </ul>
    );
};

export default PlaceList;