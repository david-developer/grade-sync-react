
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {location.pathname === "/" ? <Landing /> : <Outlet />}
        </main>
      </div>
    </AuthProvider>
  );
};

export default Index;
