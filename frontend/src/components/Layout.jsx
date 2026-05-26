import { DollarSign } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import BottomNav from './BottomNav';

export default function Layout({ children, title }) {
  const { dark, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            <span className="font-bold">FollowMoney</span>
            {title && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {title}
              </span>
            )}
          </div>
          <ThemeToggle dark={dark} toggle={toggle} />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
