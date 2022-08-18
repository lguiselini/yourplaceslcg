//Suspense is required to make lazy works :^)
import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
// SWITCH = IF THE ROUTE IS CORRECT, IT DOESN'T REDIRECT

//import Users from './user/pages/Users';
//import NewPlace from './places/pages/NewPlace';
//import UserPlaces from './places/pages/UserPlaces';
//import UpdatePlace from './places/pages/UpdatePlace';
//import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

//code splitting
//now this Users component will only be activated when it will be needed and now right from the start
const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const Auth = React.lazy(() => import('./user/pages/Auth'));

//ON TERMINAL INSTALL => npm i --save react-router-dom@5 --save-react
// THIS PACKAGE ALLOW US TO RE ROUTE THE URL TO THE CORRECT COMPONENT WITHOUT PARSING MANUALLY - EASY ROUTING

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    //now every rendered page like <Users /> has access to this AuthContext
    <AuthContext.Provider
      value={{
        // isLoggedIn: isLoggedIn, 
     //converts to true or false from the string
        isLoggedIn: !!token,
        //we will need this token for other requests later, so we are storing it here
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>
        <Suspense fallback={
        <div className='center'>
        <LoadingSpinner />
        </div>}>
        {routes}
        </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
