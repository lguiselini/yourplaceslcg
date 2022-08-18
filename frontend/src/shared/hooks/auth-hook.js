import { useState, useCallback, useEffect } from 'react';

//auto-logout
let logoutTimer;

export const useAuth = () => {
  //with authorization 
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  //avoiding infinite loops 
  //we are expecting the token to login too in auth.js (auth.login(responseData.userId, responseData.token);)
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);

    //the token will expire in 1 hour, like the backend stated (get the current time in milisecond and add 1 hour)
    //note the scoping here, it's not the same as the useState above
    //1000 * 60 * 60
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);

     //using local storage as a way to store tokens for the browser
    //Note: see 'cross side scripting vulnerabilities' for more info
    //localStorage = global javacript browser api, we can only write text here, that's why we are using stringify to turn objects into text
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
     //remove the token when we logout
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    //if the token(dependency) changes we work with the time ()
    if (token && tokenExpirationDate) {
      //we need to calculate the remaining time and not just put the tokenExpirationDate after logout
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  //[] = since the dependencies are empty, it will only run once when the app starts, but useEffect will only starts after the first cycle
  // BUT with [login] there, we need the useCallback to stop loops, it will only run once
  useEffect(() => {
    //parse takes the json like strings and make it back to regular structures like objects
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
       //verifying the expiration date of the token
      new Date(storedData.expiration) > new Date()
    ) {
      //like that we trigger our login logic with the stored data
      login(storedData.userId, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userId };
};