import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
const navigation = [{
  name: "Inicio",
  href: "/"
}, {
  name: "Tabla de Posiciones",
  href: "/standings"
}, {
  name: "Fixture",
  href: "/fixture"
}, {
  name: "Tribunal",
  href: "/tribunal"
}, {
  name: "Galería",
  href: "/gallery"
}, {
  name: "Quiénes Somos",
  href: "/about"
}, {
  name: "Contacto",
  href: "/contact"
}];
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-3">
            <img className="h-12 w-auto hover:scale-105 transition-transform duration-300" src="/logo.png" alt="Club Logo" />
            <span className="text-xl font-bold text-primary">CD Manuel Montt</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </Button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map(item => <Link key={item.name} to={item.href} className={`text-sm font-semibold leading-6 transition-colors hover:text-primary ${isActive(item.href) ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              {item.name}
            </Link>)}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="lg:hidden border-t bg-background">
          <div className="space-y-2 px-4 pb-4 pt-2">
            {navigation.map(item => <Link key={item.name} to={item.href} className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${isActive(item.href) ? "text-primary bg-accent" : "text-muted-foreground hover:text-primary hover:bg-accent"}`} onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </Link>)}
          </div>
        </div>}
    </header>;
}