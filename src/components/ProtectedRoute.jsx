import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading.user && !user) {
      navigate('/login');
    }
  }, [user, loading.user, navigate]);

  if (loading.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple" />
      </div>
    );
  }

  return user ? children : null;
};

export default ProtectedRoute; 