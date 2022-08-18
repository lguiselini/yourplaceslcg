import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
   // const [isLoading, setIsLoading] = useState(false);
 // const [error, setError] = useState();
 
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();
  //DUMMY DATA
  // const USERS = [
   //with this useEffect we can run a certain code, only when some dependencies changes
   //[] empty, so it will only run once

  useEffect(() => {
    const fetchUsers = async () => {
       // setIsLoading(true);
      try {
        //the default request for fetch is GET
        //also, the default sendRequest is ok in this case, since the default parameters are specified in the http-hook
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users'
        );
         //already in the hook
    // const responseData = await response.json();
//
    // if (!response.ok) {
    //   throw new Error(responseData.message);
    // }
//
        setLoadedUsers(responseData.users);
      } catch (err) {
        //  setError(err.message);
      } //setIsLoading(false); 
    };
    fetchUsers();
  }, [sendRequest]);
    // const errorHandler = () => {
  //   setError(null);
  // };

    //dummy users
//    {
//    id: 'u1',
//    name: 'Max',
//    image: 'https://pm1.narvii.com/6225/4d381cb8c0afa401125e38981fb1275390e74217_128.jpg',
//    places: 3
//  },
//  {
//    id: 'u2',
//    name: 'Maxerin',
//    image: 'https://pm1.narvii.com/6225/4d381cb8c0afa401125e38981fb1275390e74217_128.jpg',
//    places: 10
//  }
//];

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
