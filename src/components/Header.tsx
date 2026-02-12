import { Moon, Sun, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const Header = () => {
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <NavLink to="/" className="flex items-center gap-2 group">
          <BookHeart className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Emotion Insight
          </span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
          }>
            Journal
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
          }>
            Dashboard
          </NavLink>
          <Button variant="ghost" size="icon" onClick={toggle} className="ml-2">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
