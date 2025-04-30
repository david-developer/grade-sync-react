
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Bell, 
  Calendar, 
  Upload, 
  LogOut, 
  Menu, 
  X,
  User,
  FileSearch,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    const commonLinks = [
      { text: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    ];

    if (user.role === "student") {
      return [
        ...commonLinks,
        { text: "My Grades", href: "/student/grades", icon: <FileText className="h-4 w-4 mr-2" /> },
        { text: "Resit Exams", href: "/student/resit-exams", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/student/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    if (user.role === "instructor") {
      return [
        ...commonLinks,
        { text: "Upload Grades", href: "/instructor/upload-grades", icon: <Upload className="h-4 w-4 mr-2" /> },
        { text: "Resit Exams", href: "/instructor/resit-exams", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Registrations", href: "/instructor/registrations", icon: <FileSearch className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/instructor/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    if (user.role === "faculty_secretary") {
      return [
        ...commonLinks,
        { text: "Upload Schedule", href: "/faculty/upload-schedule", icon: <Upload className="h-4 w-4 mr-2" /> },
        { text: "Manage Resits", href: "/faculty/manage-resits", icon: <Calendar className="h-4 w-4 mr-2" /> },
        { text: "Notifications", href: "/faculty/notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
      ];
    }

    return commonLinks;
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const navLinks = getNavLinks();

  return (
    <header className="relative z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105">
            <BookOpen className="h-6 w-6 text-white" />
            <span className="font-bold text-xl tracking-tight">Exam Management System</span>
          </Link>

          {/* Mobile menu toggle */}
          {user && (
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMobileMenu}
                className="text-white hover:bg-white/20"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}

          {/* Desktop navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-all duration-200"
                >
                  {link.icon}
                  {link.text}
                </Link>
              ))}
              <div className="ml-4 relative">
                <div 
                  className="flex items-center space-x-2 rounded-md px-3 py-2 hover:bg-white/10 cursor-pointer transition-all duration-200"
                  onClick={toggleUserMenu}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-blue-800 text-white">
                      {user.email ? getInitials(user.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{user.email}</span>
                  <ChevronDown className="h-4 w-4 opacity-75" />
                </div>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-2 dark:bg-gray-800 border border-white/10 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>

        {/* Mobile navigation */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-1 pb-3 border-t border-white/20 pt-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center px-4 py-3 rounded-lg hover:bg-white/20 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.text}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/20">
              <span className="px-4 py-1 text-sm text-white/70 block">{user.email}</span>
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start px-4 py-3 text-white hover:bg-white/20 rounded-lg mt-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
