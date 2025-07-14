import React from 'react';

import './UserList.css';
import UserItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card/Card";

const UserList = ({users}) => { // Destructure `items` from props

    if (!users || users.length === 0) { // Also check for `items` being truthy
        return (
            <div className="center">
                <Card>
                    <h2>No users found</h2>
                </Card>
            </div>
        );
    }

    return (
        <ul className="users-list">
            {users.map((user) => (
                <UserItem
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    image={user.image}
                    placeCount={user.places.length}
                />
            ))}
        </ul>
    );
}

export default UserList;
