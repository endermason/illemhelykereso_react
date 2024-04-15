import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Terkep } from '../../components/terkep';
import Mbox from '../../components/mbox';
import { Hely } from '../../components/fbtojson';

export const Map = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    return (
        <div>
            <div>
                <Hely />;
                <Mbox />;
            </div>
            <div style={{ position: "fixed", zIndex: 1 }}>

            {currentUser ? <p>Logged in as {currentUser.email}</p> : <p>No user logged in</p>}
            </div>
        </div>
    );
};