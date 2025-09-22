import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img className="h-10 w-auto" src="/logo.png" alt="Club Logo" />
              <span className="text-lg font-bold text-primary">Club de Fútbol</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Promoviendo el deporte del fútbol en todas las edades, fomentando los valores 
              de respeto, trabajo en equipo y fair play.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/standings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tabla de Posiciones
                </Link>
              </li>
              <li>
                <Link to="/tribunal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tribunal
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Quiénes Somos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contacto@clubfutbol.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Club de Fútbol. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}