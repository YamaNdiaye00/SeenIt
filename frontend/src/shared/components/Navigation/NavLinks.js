import React, {useContext} from 'react';
import {NavLink} from 'react-router-dom';

import {AuthContext} from "../../context/auth-context";
import './NavLinks.css';

const NavLinks = () => {
    const auth = useContext(AuthContext);

    return (
        <NavLink className="nav-links" to="/">
            <li>
                <NavLink to="/" exact>ALL USERS</NavLink>
            </li>
            {auth.isLoggedIn && (
                <li>
                    <NavLink to={auth.userId + "/places"}>MY PLACES</NavLink>
                </li>
            )
            }
            {auth.isLoggedIn && (
                <li>
                    <NavLink to="/places/new">NEW PLACE</NavLink>
                </li>
            )
            }
            {!auth.isLoggedIn && (
                <li>
                    <NavLink to="/auth">AUTHENTICATE</NavLink>
                </li>
            )
            }
            {auth.isLoggedIn && (
                <button onClick={auth.logout}>LOGOUT</button>
            )}
        </NavLink>
    );
};

export default NavLinks;