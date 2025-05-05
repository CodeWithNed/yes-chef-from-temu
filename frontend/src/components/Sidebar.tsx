import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User, Clock, FileText } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Proposals', href: '/proposals', icon: FileText },
    { name: 'Account', href: '/account', icon: User },
    { name: 'History', href: '/history', icon: Clock },
  ];

  return (
      <div className="hidden md:flex flex-col w-64 bg-gray-800 text-white h-screen sticky top-0">
        <div className="p-4 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">Business Finder</h1>
        </div>

        <nav className="flex-1 mt-6">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                  <li key={item.name}>
                    <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-700 ${
                            isActive ? 'bg-gray-700' : ''
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-semibold text-sm">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-400">john@example.com</p>
            </div>
          </div>
        </div>
      </div>
  );
}