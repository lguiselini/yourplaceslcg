import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
  const auth = useContext(AuthContext);
  //set to true, since initially we are in LOGIN mode
  const [isLoginMode, setIsLoginMode] = useState(true);
   //using these states to update our UI
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  //initially the form is invalid, so it's typed as FALSE, when the user opens the website, 
    //the value of the email part is empty and so is the password, hence both are invalid too (FALSE)
    //With this initial state set, now you put the 'const' part since useForm RETURNS an array with 3 elements (see form-hok.js file)
    //the 3 elements are "return [formState, inputHandler, setFormData]" 
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

    //switch the mode of the form, to manage this, we utilize a state, because this component has to be re-rendered, at least in parts
    //If you have multiple state changes in the same synchronous code block (in the same function, all steps execute immediatly after each other),
    //REACT WILL batch them together and form a single state update, avoiding unnecessary render cycles
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
           //we need to copy the existing fields (email and password), otherwise we would lose them
                    //this way we only overwrite the name
                    //we still need to update the logic in the form-hook see in the file
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } //WE ARE IN LOGIN MODE MOVING TO SIGN UP MODE
    else {
      setFormData(
        {
          ...formState.inputs,
          name: {
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
    }
    //this changes to the contrary mode, since the initial mode is LOGIN
    setIsLoginMode(prevMode => !prevMode);
  };

   //not just log in, but also send a HTTP request using fetch();
  const authSubmitHandler = async event => {
    event.preventDefault();

    //before we send the request, we set this, since we are loading and we need to update the UI
        //setting it out
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          //compare with the sendRequest in http-hooks to see which arguments it's important to input
          process.env.REACT_APP_BACKEND_URL + '/users/login',
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        );
        auth.login(responseData.userId, responseData.token);
      } catch (err) //empty here because of the hook
      {}
    } else {
      try {
        //images are binary data, we cannot use json format to write them, so we will use FormData (browser API)
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);
         //IF we are in signup mode, we send this request
            // console.log('SUBMITED');
        //console.log(formState.inputs);
        //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users/signup',
          'POST',
          formData
        );

//we only log in if we didn't have an error
        //since we are using authentication with the token, now it's responseData.userId
        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    }
  };

  return (
    <React.Fragment>
    {/* see the props in the ErrorModal file if unclear, inside the {} is the error and errorHandler set in this component */}
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
      {/* if loading (true) show the LoadingSpinner */}
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
        {/*If it's not logged, it will show the other INPUT*/}   
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {/* only show the image upload, if we are in login mode */}
          {!isLoginMode && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image."
              /* AS A REMINDER OF WHAT inputHandler is:
        const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
          type: 'INPUT_CHANGE', 
          value: value, 
          isValid: isValid, 
          inputId: id});
      }, []);*/
            />
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
           {/*Since the isLoginMode the default mode of the site, it will show LOGIN in the button, otherwise it will appear as SIGN UP */}
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
