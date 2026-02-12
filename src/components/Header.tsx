import { useState } from 'react';
import { Moon, Sun, BookHeart, Menu, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { to: '/', label: 'Journal' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dataset', label: 'Dataset' },
  { to: '/install', label: 'Install App' },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`;

const Header = () => {
  const { isDark, toggle } = useTheme();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4">
        <NavLink to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <BookHeart className="h-6 w-6 md:h-7 md:w-7 text-primary transition-transform group-hover:scale-110" />
          <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Sentira
          </span>
        </NavLink>

        {/* Desktop nav */}
        {!isMobile && (
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
            ))}
            <Button variant="ghost" size="icon" onClick={toggle} className="ml-2">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>
        )}

        {/* Mobile controls */}
        {isMobile && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && open && (
        <nav className="border-t border-border/50 bg-background/95 backdrop-blur-md px-4 pb-4 pt-2 space-y-1 animate-fade-slide-up">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
