import { createContext } from 'react';

//isLoggedIn = property in that object initializing this context, LOGIN AND LOGOUT as methods 
//now we can share this object between components 
export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {}
});
