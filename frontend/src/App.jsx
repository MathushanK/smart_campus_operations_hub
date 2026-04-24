import AppRoutes from "./routes/AppRoutes";
import LoadingPage from './components/LoadingPage';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';

function App() {
  const { loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Minimum loading time of 4 seconds
    const minLoadingTime = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(minLoadingTime);
  }, []);

  if (loading || showLoading) return <LoadingPage />;
  
  return <AppRoutes />;
}

export default App;
