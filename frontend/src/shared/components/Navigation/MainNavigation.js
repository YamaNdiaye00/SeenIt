import React, {useState} from 'react';
import {Link} from "react-router-dom";


import MainHeader from "./MainHeader";
import './MainNavigation.css'
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop/Backdrop";

const MainNavigation = () => {
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerIsOpen(!drawerIsOpen)
    }

    return (
        <React.Fragment>
            {drawerIsOpen && <Backdrop onClick={toggleDrawer}/>}
            <SideDrawer show={drawerIsOpen} onClick={toggleDrawer}>
                <nav className="main-navigation__drawer-nav">
                    <NavLinks/>
                </nav>
            </SideDrawer>
            <MainHeader>
                <button className="main-navigation__menu-btn" onClick={toggleDrawer}>
                    <span/>
                    <span/>
                    <span/>
                </button>
                <h1 className="main-navigation__title">
                    <Link to="/">
                        <span style={{color: "gray"}}>S</span>
                        <span style={{color: "white"}}>e</span>
                        <span style={{color: "white"}}>e</span>
                        <span style={{color: "white"}}>n</span>
                        <span style={{color: "gray"}}>I</span>
                        <span style={{color: "white"}}>t</span>
                    </Link>
                </h1>
                <nav className="main-navigation__header-nav">
                    <NavLinks/>
                </nav>
            </MainHeader>
        </React.Fragment>
    );
};

export default MainNavigation;