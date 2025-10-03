import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Match {
  id: string;
  team: { name: string };
  vs_team: { name: string };
  match_date: string;
  match_time: string;
  venue: string;
  series: string;
  round: string;
  tournament: { name: string };
}

export default function Home() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('next_matches' as any)
        .select(`
          id,
          match_date,
          match_time,
          venue,
          series,
          round,
          team:teams!next_matches_team_id_fkey(name),
          vs_team:teams!next_matches_vs_team_id_fkey(name),
          tournament:tournaments(name)
        `)
        .order('match_date', { ascending: true });

      if (error) throw error;
      setUpcomingMatches(data as any || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeTeamName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getSeriesColor = (series: string) => {
    switch (series) {
      case 'Adultos A':
        return 'bg-primary text-primary-foreground';
      case 'Adultos B':
        return 'bg-secondary text-secondary-foreground';
      case 'Senior':
        return 'bg-accent text-accent-foreground';
      case 'Super Senior':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Club Logo" 
                className="h-32 w-auto shadow-glow hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Bienvenidos a nuestro
              <span className="block hero-text">Club de Fútbol</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Pasión, compromiso y fair play en cada partido. Únete a nuestra familia futbolística 
              y vive la emoción del deporte rey.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-y-2 gap-x-6">
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">3 Series</span>
                </div>
                <div className="h-4 w-px bg-white/30"></div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Temporada 2024</span>
                </div>
              </div>
              <div className="text-white text-xs sm:text-sm mt-2">
                CD Manuel Montt compite con 2 equipos en Adultos (A y B), 1 en Senior y 1 en Super Senior.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Partidos */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Próximos Partidos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No te pierdas ninguno de nuestros encuentros
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingMatches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map((match) => (
                <Card key={match.id} className="football-card group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className={`${getSeriesColor(match.series)} font-semibold`}>
                          {match.series}
                        </Badge>
                        {match.round && (
                          <div className="text-xs font-medium text-muted-foreground">
                            Fecha {match.round}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm font-medium">
                        <div className="flex items-center justify-end text-foreground/80">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {format(new Date(match.match_date), "dd MMM", { locale: es })}
                        </div>
                        {match.match_time && (
                          <div className="flex items-center justify-end mt-1 text-foreground/80">
                            <Clock className="h-4 w-4 mr-1.5" />
                            {match.match_time.substring(0, 5)}
                          </div>
                        )}
                      </div>
                    </div>
                    {match.tournament?.name && (
                      <div className="text-xs text-center text-muted-foreground font-medium bg-muted/50 py-1 px-2 rounded">
                        {match.tournament.name}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <CardTitle className="text-center text-base sm:text-lg font-bold leading-tight">
                        <span className="text-primary hover:text-primary/80 transition-colors">
                          {capitalizeTeamName(match.team?.name || '')}
                        </span>
                        <span className="mx-2 text-muted-foreground font-normal">vs</span>
                        <span className="text-primary hover:text-primary/80 transition-colors">
                          {capitalizeTeamName(match.vs_team?.name || '')}
                        </span>
                      </CardTitle>
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground bg-accent/30 py-2 px-3 rounded-md">
                      <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                      <span className="font-medium">{match.venue}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay partidos programados</h3>
                <p className="text-muted-foreground">
                  Los próximos partidos se anunciarán pronto
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="gradient-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sigue toda la acción
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
              Mantente al día con las tablas de posiciones, tribunal de jugadores 
              suspendidos y la galería de nuestros mejores momentos.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/standings" 
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 transition-colors"
              >
                Ver Posiciones
              </a>
              <a 
                href="/gallery" 
                className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Explorar Galería
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}