import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";
interface Match {
  id: string;
  team: {
    name: string;
    id: string;
  };
  vs_team: {
    name: string;
  };
  match_date: string;
  match_time: string;
  venue: string;
  series: {
    name: string;
  };
  round: string;
  tournament: {
    name: string;
  };
  team_id: string;
}
interface MatchResult {
  result: 'win' | 'loss' | 'draw';
  opponentName: string;
  teamScore: number;
  opponentScore: number;
}
export default function Home() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamResults, setTeamResults] = useState<Record<string, MatchResult[]>>({});
  useEffect(() => {
    fetchUpcomingMatches();
  }, []);
  const fetchTeamLastResults = async (teamId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('matches').select(`
          id, 
          home_team_id, 
          away_team_id, 
          home_score, 
          away_score, 
          match_date,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `).eq('status', 'completed').or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`).not('home_score', 'is', null).not('away_score', 'is', null).order('match_date', {
        ascending: false
      }).limit(3);
      if (error) throw error;
      const results: MatchResult[] = (data || []).map((match: any) => {
        const isHome = match.home_team_id === teamId;
        const teamScore = isHome ? match.home_score : match.away_score;
        const opponentScore = isHome ? match.away_score : match.home_score;
        const opponentName = isHome ? match.away_team?.name : match.home_team?.name;
        let result: 'win' | 'loss' | 'draw';
        if (teamScore > opponentScore) result = 'win';else if (teamScore < opponentScore) result = 'loss';else result = 'draw';
        return {
          result,
          opponentName: opponentName || 'Desconocido',
          teamScore,
          opponentScore
        };
      });
      return results;
    } catch (error) {
      console.error('Error fetching team results:', error);
      return [];
    }
  };
  const fetchUpcomingMatches = async () => {
    try {
      // Fetch series first
      const { data: seriesData } = await supabase
        .from('series')
        .select('id, name');
      
      const seriesMap = new Map((seriesData || []).map(s => [s.id, s.name]));

      const { data, error } = await supabase
        .from('next_matches' as any)
        .select(`
          id,
          match_date,
          match_time,
          venue,
          round,
          team_id,
          series_id,
          team:teams!next_matches_team_id_fkey(id, name),
          vs_team:teams!next_matches_vs_team_id_fkey(name),
          tournament:tournaments(name)
        `)
        .order('match_date', { ascending: true });

      if (error) throw error;

      // Add series name to each match
      const matchesWithSeries = (data || []).map((match: any) => ({
        ...match,
        series: {
          name: seriesMap.get(match.series_id) || 'Unknown'
        }
      }));

      // Define the same series order as in Fixture page
      const seriesOrder = ['Infantil', 'Adultos', 'Senior', 'Super Senior', 'Dorada'];

      // Sort matches by series order, then by match date
      const sortedMatches = matchesWithSeries.sort((a: any, b: any) => {
        // Get series names from the series object
        const seriesA = a.series?.name || '';
        const seriesB = b.series?.name || '';
        
        const indexA = seriesOrder.indexOf(seriesA);
        const indexB = seriesOrder.indexOf(seriesB);

        // If both series are in the order array, sort by series order
        if (indexA !== -1 && indexB !== -1) {
          if (indexA !== indexB) {
            return indexA - indexB;
          }
          // If same series, sort by date
          return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
        }

        // If only one series is in the order array, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If neither series is in the order array, sort by date
        return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
      });
      setUpcomingMatches(sortedMatches);

      // Fetch last results for each team
      const resultsMap: Record<string, MatchResult[]> = {};
      for (const match of sortedMatches) {
        if (match.team_id && !resultsMap[match.team_id]) {
          resultsMap[match.team_id] = await fetchTeamLastResults(match.team_id);
        }
      }
      setTeamResults(resultsMap);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };
  const capitalizeTeamName = (name: string) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const getResultColor = (result: 'win' | 'loss' | 'draw') => {
    switch (result) {
      case 'win':
        return 'bg-green-500';
      case 'loss':
        return 'bg-red-500';
      case 'draw':
        return 'bg-yellow-500';
    }
  };
  const getSeriesColor = (series: string) => {
    switch (series) {
      case 'Infantil':
        return 'bg-blue-500 text-white';
      case 'Adultos':
      case 'Adultos A':
        return 'bg-primary text-primary-foreground';
      case 'Adultos B':
        return 'bg-secondary text-secondary-foreground';
      case 'Senior':
        return 'bg-accent text-accent-foreground';
      case 'Super Senior':
        return 'bg-orange-500 text-white';
      case 'Dorada':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <img src="/logo.png" alt="Club Logo" className="h-32 w-auto shadow-glow hover:scale-105 transition-transform duration-300" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Bienvenidos a nuestro
              <span className="block hero-text">Club de Fútbol</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Pasión, compromiso y fair play en cada partido. Únete a nuestra familia futbolística 
              y vive la emoción del deporte rey.
            </p>
            
          </div>
        </div>
      </section>

      {/* Próximos Partidos */}
      <section id="proximos-partidos" className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Próximos Partidos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No te pierdas ninguno de nuestros encuentros
            </p>
          </div>

          {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse">
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
                </Card>)}
            </div> : upcomingMatches.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map(match => <Card key={match.id} className="football-card group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-4 space-y-3">
                    {match.tournament?.name && <div className="text-center font-bold text-foreground text-base">
                        {match.tournament.name}
                      </div>}
                    <div className="flex justify-center">
                      <Badge className={`${getSeriesColor(match.series?.name || '')} font-semibold text-sm`}>
                        {match.series?.name || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                      {match.round && <span>Fecha {match.round}</span>}
                      <span>-</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(match.match_date), "dd MMM", {
                    locale: es
                  })}
                      </div>
                      {match.match_time && <>
                          <Clock className="h-4 w-4 ml-1" />
                          <span>{match.match_time.substring(0, 5)}</span>
                        </>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center space-y-2">
                      <div className="text-lg font-bold text-primary hover:text-primary/80 transition-colors py-2">
                        {capitalizeTeamName(match.team?.name || '')}
                      </div>
                      <div className="text-sm text-muted-foreground font-semibold">
                        vs
                      </div>
                      <div className="text-lg font-bold text-primary hover:text-primary/80 transition-colors py-2">
                        {capitalizeTeamName(match.vs_team?.name || '')}
                      </div>
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground bg-accent/30 py-2 px-3 rounded-md">
                      <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                      <span className="font-medium">{match.venue}</span>
                    </div>
                    <div className="border-t pt-3 mt-4">
                      <div className="text-xs font-semibold text-center text-muted-foreground mb-2">
                        Partidos Pasados
                      </div>
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          {teamResults[match.team_id]?.length > 0 ? teamResults[match.team_id].map((result, idx) => <Tooltip key={idx}>
                                <TooltipTrigger>
                                  <div className={`w-8 h-8 rounded-full ${getResultColor(result.result)} flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-110 transition-transform cursor-pointer`}>
                                    {result.result === 'win' ? 'G' : result.result === 'loss' ? 'P' : 'E'}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-semibold">{capitalizeTeamName(result.opponentName)}</p>
                                    <p className="text-sm">{result.teamScore} - {result.opponentScore}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>) : <div className="text-xs text-muted-foreground">Sin datos</div>}
                        </div>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>)}
            </div> : <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay partidos programados</h3>
                <p className="text-muted-foreground">
                  Los próximos partidos se anunciarán pronto
                </p>
              </CardContent>
            </Card>}
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
              <a href="/standings" className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 transition-colors">
                Ver Posiciones
              </a>
              <a href="/gallery" className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Explorar Galería
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>;
}