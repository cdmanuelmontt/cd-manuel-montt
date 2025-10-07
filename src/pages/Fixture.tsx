import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Icon } from "lucide-react";

// Dynamic import for soccer ball icon from @lucide/lab
const SoccerBallIcon = ({ className }: { className?: string }) => {
  const [soccerBall, setSoccerBall] = useState(null);
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const { soccerBall: importedSoccerBall } = await import("@lucide/lab");
        setSoccerBall(importedSoccerBall);
      } catch (error) {
        console.warn("Could not load soccer ball icon from @lucide/lab");
      }
    };
    loadIcon();
  }, []);

  if (soccerBall) {
    return <Icon iconNode={soccerBall} className={className} />;
  }
  
  // Fallback to a simple circle while loading or if import fails
  return <div className={`${className} rounded-full border-2 border-current`} />;
};

// Utility to capitalize the first letter of each word
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

interface Match {
  id: string;
  match_date: string;
  match_time: string;
  venue: string;
  series: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  round: string;
  tournament_id: string;
  home_team: {
    name: string;
  };
  away_team: {
    name: string;
  };
}

interface MatchByRound {
  round: string;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  series: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function Fixture() {
  const [matches, setMatches] = useState<Record<string, MatchByRound[]>>({});
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<string>('all');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      setSelectedRound('all'); // Reset round filter when tournament changes
      fetchMatches();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTournaments(data || []);
      if (data && data.length > 0) {
        setSelectedTournament(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:home_team_id(name),
          away_team:away_team_id(name)
        `)
        .eq('tournament_id', selectedTournament)
        .order('round', { ascending: true });

      if (error) throw error;

      // Get unique series from the matches and sort them in the desired order
      const seriesOrder = ['Infantil', 'Adultos', 'Senior', 'Super Senior', 'Dorada'];
      const uniqueSeriesSet = new Set((data || []).map(match => {
        let series = match.series;
        if (series === 'Adultos A' || series === 'Adultos B') {
          series = 'Adultos';
        }
        return series;
      }));
      
      // Filter and sort series according to the desired order
      const sortedSeries = seriesOrder.filter(series => uniqueSeriesSet.has(series));
      setAvailableSeries(sortedSeries);

      // Get unique rounds and sort them numerically
      const uniqueRounds = [...new Set((data || []).map(match => match.round))];
      uniqueRounds.sort((a, b) => parseInt(a) - parseInt(b));
      setAvailableRounds(uniqueRounds);

      // Group matches by series and round
      const groupedMatches = (data || []).reduce((acc, match) => {
        let key = match.series;
        if (key === 'Adultos A' || key === 'Adultos B') {
          key = 'Adultos';
        }
        
        if (!acc[key]) {
          acc[key] = [];
        }

        let roundData = acc[key].find(r => r.round === match.round);
        if (!roundData) {
          roundData = { round: match.round, matches: [] };
          acc[key].push(roundData);
        }
        
        roundData.matches.push(match);
        return acc;
      }, {} as Record<string, MatchByRound[]>);

      // Sort rounds within each series
      Object.keys(groupedMatches).forEach(seriesKey => {
        groupedMatches[seriesKey].sort((a, b) => a.round - b.round);
      });

      setMatches(groupedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Fixture
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Revisa todos los partidos y resultados por fecha
          </p>
        </div>

        {/* Tournament and Round Selectors */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
          <div className="w-64">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un torneo" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-64">
            <Select value={selectedRound} onValueChange={setSelectedRound}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una jornada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las jornadas</SelectItem>
                {availableRounds.map((round) => (
                  <SelectItem key={round} value={round}>
                    Jornada {round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {availableSeries.length > 0 ? (
          <Tabs defaultValue={availableSeries[0]} className="w-full">
            <TabsList className={`grid w-full mb-8 ${availableSeries.length === 1 ? 'grid-cols-1' : availableSeries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {availableSeries.map((serie) => (
                <TabsTrigger key={serie} value={serie} className="text-sm">
                  {serie}
                </TabsTrigger>
              ))}
            </TabsList>

          {availableSeries.map((serie) => (
            <TabsContent key={serie} value={serie}>
              <div className="space-y-6">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="football-card">
                        <CardHeader className="animate-pulse">
                          <div className="h-6 bg-muted rounded w-32"></div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="flex space-x-4 animate-pulse">
                              <div className="h-12 bg-muted rounded flex-1"></div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : matches[serie] && matches[serie].length > 0 ? (
                  (() => {
                    const filteredRounds = matches[serie].filter(roundData => 
                      selectedRound === 'all' || roundData.round === selectedRound
                    );
                    
                    return filteredRounds.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRounds.map((roundData) => (
                          <Card key={roundData.round} className="football-card h-fit">
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <div className="flex items-center space-x-2">
                                  <SoccerBallIcon className="h-5 w-5 text-primary" />
                                  <span>Fecha {roundData.round}</span>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {roundData.matches.map((match) => (
                                  <div key={match.id} className="p-2 border rounded-md hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center justify-between text-xs gap-2 min-w-0">
                                      <div className="flex-1 min-w-0">
                                        <span className="font-medium truncate block">
                                          {match.home_team?.name ? toTitleCase(match.home_team.name) : 'TBD'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-sm font-bold text-primary">
                                          {match.home_score !== null ? match.home_score : '-'}
                                        </span>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-sm font-bold text-primary">
                                          {match.away_score !== null ? match.away_score : '-'}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0 text-right">
                                        <span className="font-medium truncate block">
                                          {match.away_team?.name ? toTitleCase(match.away_team.name) : 'TBD'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="football-card">
                        <CardContent className="text-center py-12">
                          <SoccerBallIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No hay partidos para esta jornada</h3>
                          <p className="text-muted-foreground">
                            No se encontraron partidos para la jornada {selectedRound} en la serie {serie}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })()
                ) : (
                  <Card className="football-card">
                    <CardContent className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No hay partidos disponibles</h3>
                      <p className="text-muted-foreground">
                        Los partidos de la serie {serie} se actualizarán pronto
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        ) : (
          <Card className="football-card">
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay torneos disponibles</h3>
              <p className="text-muted-foreground">
                Selecciona un torneo válido
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}