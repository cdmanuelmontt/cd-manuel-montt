import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Trophy, ChevronDown, ChevronUp } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
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

      // Get unique series from the matches
      const uniqueSeries = [...new Set((data || []).map(match => {
        let series = match.series;
        if (series === 'Adultos A' || series === 'Adultos B') {
          series = 'Adultos';
        }
        return series;
      }))];
      setAvailableSeries(uniqueSeries);

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

  const toggleRound = (serie: string, round: number) => {
    const key = `${serie}-${round}`;
    setOpenRounds(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isRoundOpen = (serie: string, round: number) => {
    const key = `${serie}-${round}`;
    return openRounds[key] || false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-500 text-white";
      case 'in_progress':
        return "bg-yellow-500 text-white";
      case 'pending':
        return "bg-blue-500 text-white";
      case 'cancelled':
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return "Finalizado";
      case 'in_progress':
        return "En Progreso";
      case 'pending':
        return "Programado";
      case 'cancelled':
        return "Cancelado";
      default:
        return "Sin Estado";
    }
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

        {/* Tournament Selector */}
        <div className="mb-8 flex justify-center">
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
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {matches[serie].map((roundData) => (
                      <Collapsible 
                        key={roundData.round} 
                        open={isRoundOpen(serie, roundData.round)}
                        onOpenChange={() => toggleRound(serie, roundData.round)}
                      >
                        <Card className="football-card h-fit">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <span>Fecha {roundData.round}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {roundData.matches.length} partidos
                                  </Badge>
                                  {isRoundOpen(serie, roundData.round) ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {roundData.matches.map((match) => (
                                  <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex flex-col space-y-2 flex-1">
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`text-xs ${getMatchStatusBadge(match.status)}`}>
                                          {getMatchStatusText(match.status)}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col space-y-1 flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate">
                                              {match.home_team?.name ? toTitleCase(match.home_team.name) : 'TBD'}
                                            </span>
                                            {match.home_score !== null ? (
                                              <span className="text-lg font-bold text-primary ml-2">
                                                {match.home_score}
                                              </span>
                                            ) : (
                                              <span className="text-lg font-bold text-muted-foreground ml-2">
                                                -
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate">
                                              {match.away_team?.name ? toTitleCase(match.away_team.name) : 'TBD'}
                                            </span>
                                            {match.away_score !== null ? (
                                              <span className="text-lg font-bold text-primary ml-2">
                                                {match.away_score}
                                              </span>
                                            ) : (
                                              <span className="text-lg font-bold text-muted-foreground ml-2">
                                                -
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
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