import React, {useEffect, useState} from "react";

import UserList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner/LoadingSpinner";

import {useHttpClient} from "../../shared/hooks/http-hook";

const Users = () => {
    const [loadedUsers, setLoadedUsers] = useState();
    const {isLoading, error, sendRequest, clearError} = useHttpClient()


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest('/api/users/')
                setLoadedUsers(responseData.users)
            } catch (err) {
            }

        }
        fetchUsers();

    }, [sendRequest]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            {isLoading && <LoadingSpinner asOverlay/>}
            {!isLoading && loadedUsers && <UserList users={loadedUsers}/>}
        </React.Fragment>
    );
}
export default Users;