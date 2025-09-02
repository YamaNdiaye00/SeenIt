import React, {useContext} from 'react';
import {useNavigate} from "react-router-dom";

import Input from "../../shared/components/FormElements/Input/Input";
import Button from "../../shared/components/FormElements/Button/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload/ImageUpload";

import {VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from '../../shared/util/validators';
import {useForm} from "../../shared/hooks/form-hooks"
import {useHttpClient} from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";

import './PlaceForm.css'

const NewPlace = () => {
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient()

    const [formState, inputHandler] = useForm(
        {
            title: {
                value: '',
                isValid: false
            },
            description: {
                value: '',
                isValid: false
            },
            address: {
                value: '',
                isValid: false
            },
            image: {
                value: null,
                isValid: false
            }
        },
        false
    );

    const navigate = useNavigate();

    const placeSubmitHandler = async event => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", formState.inputs.title.value);
            formData.append("description", formState.inputs.description.value);
            formData.append("address", formState.inputs.address.value);
            formData.append("creator", auth.userId);
            formData.append("image", formState.inputs.image.value);
            await sendRequest(`/api/places`, 'POST',
                formData,
                {
                    Authorization: `Bearer ${auth.token}`
                }
            )
            navigate('/');
        } catch (err) {

        }

    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onCancel={clearError}/>
            {isLoading && <LoadingSpinner asOverlay/>}
            <form className="place-form" onSubmit={placeSubmitHandler}>
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title."
                    onInput={inputHandler}
                />
                <Input
                    id="description"
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (at least 6 characters)."
                    onInput={inputHandler}
                />
                <Input
                    id="address"
                    element="input"
                    label="Address"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid address."
                    onInput={inputHandler}
                />
                <ImageUpload center id="image" onInput={inputHandler} errorText="Please enter a valid image."/>
                <Button type="submit" disabled={!formState.isValid}>
                    ADD PLACE
                </Button>
            </form>
        </React.Fragment>
    );
};

export default NewPlace;
