import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart2, Settings } from 'lucide-react';

const LINKS = [
  { to: '/',         label: 'Inicio',    Icon: LayoutDashboard },
  { to: '/ingresar', label: 'Ingresar',  Icon: PlusCircle      },
  { to: '/analisis', label: 'Análisis',  Icon: BarChart2       },
  { to: '/config',   label: 'Config',    Icon: Settings        },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
      <div className="max-w-2xl mx-auto flex">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={21} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
