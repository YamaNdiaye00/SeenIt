import './App.css';
import React from "react";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";

import Users from "./users/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./users/pages/Auth";
import {AuthContext} from "./shared/context/auth-context";
import {useAuth} from "./shared/hooks/auth-hook";

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
        <AuthContext.Provider value={{isLoggedIn: !!token, token: token, userId: userId, login: login, logout: logout}}>
            <Router>
                <MainNavigation/>
                <main>
                    <Routes>
                        {routes}
                    </Routes>
                </main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
