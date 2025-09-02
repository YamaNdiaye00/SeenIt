import React, {useContext, useState} from "react";

import Input from "../../shared/components/FormElements/Input/Input";
import Button from "../../shared/components/FormElements/Button/Button";
import Card from "../../shared/components/UIElements/Card/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload/ImageUpload";

import {VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from "../../shared/util/validators";
import {useForm} from "../../shared/hooks/form-hooks";
import {AuthContext} from "../../shared/context/auth-context";
import {useHttpClient} from "../../shared/hooks/http-hook";

import './Auth.css'

const Auth = props => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setLoginMode] = useState(true);
    const {isLoading, error, sendRequest, clearError} = useHttpClient()

    const [formState, inputHandler, setFormData] = useForm(
        {
            email: {
                value: '',
                isValid: false
            },
            password: {
                value: '',
                isValid: false
            },
        },
        false
    );

    const authSubmitHandler = async event => {
            event.preventDefault();

            console.log(formState.inputs);

            if (isLoginMode) {
                try {
                    const responseData = await sendRequest('/api/users/login',
                        'POST',
                        JSON.stringify({
                            email: formState.inputs.email.value,
                            password: formState.inputs.password.value,
                        }),
                        {
                            'Content-Type': 'application/json'
                        })
                    auth.login(responseData.userId, responseData.token)
                    console.log(auth)

                } catch (err) {

                }

            } else {
                try {
                    const formData = new FormData();
                    formData.append("email", formState.inputs.email.value);
                    formData.append("password", formState.inputs.password.value);
                    formData.append("name", formState.inputs.name.value);
                    formData.append('image', formState.inputs.image.value);

                    const responseData = await sendRequest('/api/users/signup',
                        'POST',
                            formData,
                       );

                    auth.login(responseData.userId, responseData.token)
                } catch (err) {

                }
            }
        }
    ;

    const switchModeHandler = event => {
        if (!isLoginMode) {
            setFormData({
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                },
                formState.inputs.email.isValid && formState.inputs.password.isValid);
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false)
        }
        setLoginMode(prevMode => !prevMode)
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay/>}
                <h2>Login Required</h2>
                <hr/>
                {!isLoginMode &&
                    <Input
                        element="input"
                        id="name"
                        label="Your Name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a name."
                        onInput={inputHandler}
                    />
                }
                {!isLoginMode && (<ImageUpload center id="image" onInput={inputHandler} errorText="Please enter a valid image." />)}
                <form onSubmit={authSubmitHandler}>

                    <Input
                        id="email"
                        element="input"
                        type="email"
                        label="E-mail"
                        validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email adress."
                        onInput={inputHandler}
                    />

                    <Input
                        id="password"
                        element="input"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText="Please enter a valid password."
                        onInput={inputHandler}
                    />

                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? "LOG IN" : "SIGN UP"}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>SWITCH TO {isLoginMode ? "SIGN UP" : "LOG IN"}</Button>
            </Card>
        </React.Fragment>
    );
};

export default Auth;
