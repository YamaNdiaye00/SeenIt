import React, {useContext, useState} from 'react';

import Card from "../../shared/components/UIElements/Card/Card";
import Button from "../../shared/components/FormElements/Button/Button";
import Modal from "../../shared/components/UIElements/Modal/Modal";
import Map from "../../shared/components/UIElements/Map/Map";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner/LoadingSpinner";

import {AuthContext} from "../../shared/context/auth-context";
import {useHttpClient} from "../../shared/hooks/http-hook";

import './PlaceItem.css'

const PlaceItem = (props) => {
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const toggleMap = () => {
        setShowMap(!showMap)
    }

    const toggleConfirmModal = () => {
        setShowConfirmModal(!showConfirmModal);
    }

    const confirmDeleteHandler = async () => {
        toggleConfirmModal();
        try {
            await sendRequest(
                '/api/places/${props.id}',
                'DELETE',
                null,
                {
                    Authorization: `Bearer ${auth.token}`
                }
            );
        } catch (err) {
        }
        props.onDelete(props.id);

    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onCancel={clearError}/>
            <Modal
                show={showMap}
                onCancel={toggleMap}
                header={props.address}
                contentClass="place-item__modal-content"
                footerClass="place-item__modal-actions"
                footer={<Button onClick={toggleMap}>CLOSE</Button>}
            >
                <div className="map-container">
                    <h2><Map center={props.coordinates} zoom={16}/></h2>
                </div>
            </Modal>

            <Modal
                show={showConfirmModal}
                onCancel={toggleConfirmModal}
                header="Are you sure?"
                footerClass="place-item__modal-actions"
                footer={
                    <React.Fragment>
                        <Button inverse onClick={toggleConfirmModal}>CANCEL</Button>
                        <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
                    </React.Fragment>
                }
            >
                <p>Do you want to proceed and delete this place? Please note that it cannot be undone thereafter</p>
            </Modal>

            <li className="place-item">
                <Card className="place-item__content">
                    {isLoading && <LoadingSpinner asOverlay/>}

                    <div className="place-item__image">
                        <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/${props.image}`}
                            alt={props.title}
                            style={{width: '100%', objectFit: 'cover', border: '1px solid red'}} // optional debug
                        />
                    </div>

                    <div className="place-item__info">
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className="place-item__actions">
                        <Button inverse onClick={toggleMap}>VIEW ON MAP</Button>
                        {auth.userId === props.creatorId &&
                            <Button to={`/places/${props.id}`}>EDIT</Button>
                        }
                        {auth.userId === props.creatorId &&
                            <Button danger onClick={toggleConfirmModal}>DELETE</Button>
                        }

                    </div>
                </Card>
            </li>
        </React.Fragment>

    );
};

export default PlaceItem;