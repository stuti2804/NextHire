import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  BarChart, 
  Settings,
  Briefcase
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'My Resumes', icon: FileText, href: '/resumes' },
  { name: 'Job Matches', icon: Briefcase, href: '/jobs' },
  { name: 'Resources', icon: BookOpen, href: '/resources' },
  { name: 'Analytics', icon: BarChart, href: '/analytics' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  return (
    <div className={`w-64 bg-white border-r border-gray-200 overflow-y-auto ${className}`}>
      <div className="h-full px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-indigo-600"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;