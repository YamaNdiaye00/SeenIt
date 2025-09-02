import './App.css';
import React, {Suspense} from "react";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";

// import Users from "./users/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
// import UserPlaces from "./places/pages/UserPlaces";
// import UpdatePlace from "./places/pages/UpdatePlace";
// import Auth from "./users/pages/Auth";

import MainNavigation from "./shared/components/Navigation/MainNavigation";
import {AuthContext} from "./shared/context/auth-context";
import {useAuth} from "./shared/hooks/auth-hook";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner/LoadingSpinner";

const Users = React.lazy(() => import("./users/pages/Users"));
const Auth = React.lazy(() => import("./users/pages/Auth"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));

const App = () => {

    const {token, login, logout, userId} = useAuth();

    let routes;
    if (token) {
        routes = (
            <React.Fragment>
                <Route path='/' exact element={<Users/>}/>
                <Route path='/places/new' exact element={<NewPlace/>}/>
                <Route path='/places/:placeId' exact element={<UpdatePlace/>}/>
                <Route path='/:userId/places' exact element={<UserPlaces/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </React.Fragment>
        );
    } else {
        routes = (
            <React.Fragment>
                <Route path='/' exact element={<Users/>}/>
                <Route path='/:userId/places' exact element={<UserPlaces/>}/>
                <Route path='/places/:placeId' exact element={<UpdatePlace/>}/>
                <Route path='/auth' exact element={<Auth/>}/>
                <Route path="*" element={<Navigate to="/auth" replace/>}/>
            </React.Fragment>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token, token: token, userId: userId, login: login, logout: logout
            }}>
            <Router>
                <MainNavigation/>
                <main><Suspense fallback=
                                    {<div className='center'>
                                        <LoadingSpinner/>
                                    </div>
                                    }>
                    <Routes>

                        {routes}
                    </Routes>
                </Suspense>

                </main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
