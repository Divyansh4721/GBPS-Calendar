import { Navigate } from 'react-router-dom';
import { checkTokenValid } from '../pages/firebase';
const ProtectedRoute = ({ children }) => {
    if (!checkTokenValid()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};
export default ProtectedRoute;