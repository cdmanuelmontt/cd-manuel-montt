// Utility to capitalize the first letter of each word
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Standing {
  id: string;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  phase_id: string | null;
  group_id: string | null;
  team: {
    name: string;
  };
}

interface StandingByGroup {
  groupId: string | null;
  groupName: string;
  groupOrder: number;
  standings: Standing[];
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Series {
  id: string;
  name: string;
  position: number;
}

export default function Standings() {
  const [standings, setStandings] = useState<Record<string, StandingByGroup[]>>({});
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Record<string, Array<{id: string, name: string}>>>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  useEffect(() => {
    fetchTournamentsAndSeries();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchStandings();
    }
  }, [selectedTournament]);

  const fetchTournamentsAndSeries = async () => {
    try {
      // Fetch tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      setTournaments(tournamentsData || []);
      
      // Set default tournament (newest active)
      if (tournamentsData && tournamentsData.length > 0) {
        setSelectedTournament(tournamentsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching tournaments and series:', error);
    }
  };

  const fetchStandings = async () => {
    if (!selectedTournament) return;
    
    setLoading(true);
    try {
      // Fetch series for the selected tournament
      const { data: tournamentSeriesData, error: seriesError } = await supabase
        .from('tournament_series' as any)
        .select(`
          series_id,
          series:series_id (
            id,
            name,
            position
          )
        `)
        .eq('tournament_id', selectedTournament);

      if (seriesError) throw seriesError;

      // Extract and sort series by position
      const seriesForTournament = (tournamentSeriesData || [])
        .map((ts: any) => ts.series)
        .filter((s: any) => s !== null)
        .sort((a: any, b: any) => a.position - b.position);

      setSeriesList(seriesForTournament as unknown as Series[]);
      
      // Create series map for lookup
      const seriesMap = new Map((seriesForTournament as any[]).map(s => [s.id, s.name]));

      // Fetch groups
      const { data: groupsData } = await supabase
        .from('phase_groups' as any)
        .select('id, group_name, group_order, phase_id');

      const groupsMap = new Map((groupsData || []).map((g: any) => [g.id, { id: g.id, group_name: g.group_name, group_order: g.group_order }]));

      // Fetch standings for the selected tournament
      const { data, error } = await supabase
        .from('standings' as any)
        .select(`
          *,
          team:team_id(name)
        `)
        .eq('tournament_id', selectedTournament)
        .order('position', { ascending: true });

      if (error) throw error;

      // Get available groups per series
      const groupsBySeries: Record<string, Array<{id: string, name: string}>> = {};
      (data || []).forEach((standing: any) => {
        const seriesName = seriesMap.get(standing.series_id) || '';
        if (seriesName && standing.group_id) {
          if (!groupsBySeries[seriesName]) {
            groupsBySeries[seriesName] = [];
          }
          const group = groupsMap.get(standing.group_id);
          if (group) {
            const existingGroup = groupsBySeries[seriesName].find(g => g.id === standing.group_id);
            if (!existingGroup) {
              groupsBySeries[seriesName].push({
                id: standing.group_id,
                name: group.group_name
              });
            }
          }
        }
      });

      // Sort groups by group_order
      Object.keys(groupsBySeries).forEach(seriesName => {
        groupsBySeries[seriesName].sort((a, b) => {
          const groupA = groupsMap.get(a.id);
          const groupB = groupsMap.get(b.id);
          return (groupA?.group_order || 0) - (groupB?.group_order || 0);
        });
      });

      setAvailableGroups(groupsBySeries);

      // Group by series, then by group
      const groupedStandings: Record<string, StandingByGroup[]> = {};
      
      for (const standing of (data || []) as any[]) {
        const seriesName = seriesMap.get(standing.series_id) || 'Unknown';
        
        if (!groupedStandings[seriesName]) {
          groupedStandings[seriesName] = [];
        }

        const groupId = standing.group_id || null;
        const groupInfo = groupId ? groupsMap.get(groupId) : null;
        const groupName = groupInfo ? groupInfo.group_name : 'General';
        const groupOrder = groupInfo ? groupInfo.group_order : 0;

        let groupData = groupedStandings[seriesName].find((g: StandingByGroup) => g.groupId === groupId);
        if (!groupData) {
          groupData = { 
            groupId, 
            groupName, 
            groupOrder,
            standings: [] 
          };
          groupedStandings[seriesName].push(groupData);
        }

        groupData.standings.push(standing);
      }

      // Sort groups by group_order within each series
      Object.keys(groupedStandings).forEach(seriesKey => {
        groupedStandings[seriesKey].sort((a, b) => a.groupOrder - b.groupOrder);
      });

      setStandings(groupedStandings);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (position <= 3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (position <= 6) return <Minus className="h-4 w-4 text-gray-400" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-yellow-500 text-white";
    if (position <= 3) return "bg-green-500 text-white";
    if (position <= 6) return "bg-blue-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Tabla de Posiciones
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sigue el rendimiento de todos nuestros equipos
          </p>
        </div>

        {/* Tournament Filter */}
        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium text-foreground mb-2">
            Seleccionar Torneo
          </label>
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

        {seriesList.length > 0 && (
          <Tabs defaultValue={seriesList[0]?.name} className="w-full">
            <TabsList className={`grid w-full mb-8`} style={{ gridTemplateColumns: `repeat(${seriesList.length}, minmax(0, 1fr))` }}>
              {seriesList.map((serie) => (
                <TabsTrigger key={serie.id} value={serie.name} className="text-sm">
                  {serie.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {seriesList.map((serie) => (
            <TabsContent key={serie.id} value={serie.name}>
              {/* Group Filter - Only show if this series has groups */}
              {availableGroups[serie.name] && availableGroups[serie.name].length > 0 && (
                <div className="mb-6 flex justify-center">
                  <div className="w-64">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un grupo" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">Todos los grupos</SelectItem>
                        {availableGroups[serie.name].map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {loading ? (
                  <Card className="football-card">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="flex space-x-4 animate-pulse">
                            <div className="h-8 bg-muted rounded w-8"></div>
                            <div className="h-8 bg-muted rounded flex-1"></div>
                            <div className="h-8 bg-muted rounded w-16"></div>
                            <div className="h-8 bg-muted rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : standings[serie.name] && standings[serie.name].length > 0 ? (
                  (() => {
                    const filteredGroups = standings[serie.name].filter(groupData => 
                      selectedGroup === 'all' || groupData.groupId === selectedGroup
                    );
                    
                    return filteredGroups.length > 0 ? (
                      filteredGroups.map((groupData) => (
                        <Card key={groupData.groupId || 'general'} className="football-card">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Trophy className="h-5 w-5 text-primary" />
                              <span>
                                {groupData.groupId ? groupData.groupName : `Serie ${serie.name}`}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12 md:table-cell hidden">Pos</TableHead>
                                    <TableHead className="text-center w-16 md:hidden">Pts</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead className="text-center w-16 hidden md:table-cell">PJ</TableHead>
                                    <TableHead className="text-center w-16 hidden md:table-cell">PG</TableHead>
                                    <TableHead className="text-center w-16 hidden md:table-cell">PE</TableHead>
                                    <TableHead className="text-center w-16 hidden md:table-cell">PP</TableHead>
                                    <TableHead className="text-center w-16 hidden lg:table-cell">GF</TableHead>
                                    <TableHead className="text-center w-16 hidden lg:table-cell">GC</TableHead>
                                    <TableHead className="text-center w-16 hidden lg:table-cell">DG</TableHead>
                                    <TableHead className="text-center w-16 hidden md:table-cell">Pts</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {groupData.standings.map((standing) => (
                                    <TableRow key={standing.id} className="hover:bg-muted/50">
                                      <TableCell className="md:table-cell hidden">
                                        <div className="flex items-center space-x-2">
                                          <Badge className={`w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs ${getPositionBadge(standing.position)}`}>
                                            {standing.position}
                                          </Badge>
                                          {getPositionIcon(standing.position)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center font-bold text-primary md:hidden">
                                        {standing.points}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {standing.team?.name ? toTitleCase(standing.team.name) : ''}
                                      </TableCell>
                                      <TableCell className="text-center hidden md:table-cell">
                                        {standing.matches_played}
                                      </TableCell>
                                      <TableCell className="text-center hidden md:table-cell">
                                        {standing.wins}
                                      </TableCell>
                                      <TableCell className="text-center hidden md:table-cell">
                                        {standing.draws}
                                      </TableCell>
                                      <TableCell className="text-center hidden md:table-cell">
                                        {standing.losses}
                                      </TableCell>
                                      <TableCell className="text-center hidden lg:table-cell">
                                        {standing.goals_for}
                                      </TableCell>
                                      <TableCell className="text-center hidden lg:table-cell">
                                        {standing.goals_against}
                                      </TableCell>
                                      <TableCell className="text-center hidden lg:table-cell">
                                        <span className={`font-medium ${
                                          standing.goals_for - standing.goals_against > 0 
                                            ? 'text-green-600' 
                                            : standing.goals_for - standing.goals_against < 0 
                                            ? 'text-red-600' 
                                            : 'text-gray-600'
                                        }`}>
                                          {standing.goals_for - standing.goals_against > 0 ? '+' : ''}
                                          {standing.goals_for - standing.goals_against}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center font-bold text-primary hidden md:table-cell">
                                        {standing.points}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="football-card">
                        <CardContent className="text-center py-12">
                          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No hay datos para este grupo</h3>
                          <p className="text-muted-foreground">
                            No se encontraron posiciones para el grupo seleccionado en la serie {serie.name}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })()
                ) : (
                  <Card className="football-card">
                    <CardContent className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                      <p className="text-muted-foreground">
                        Las posiciones de la serie {serie.name} se actualizarán pronto
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        )}
      </div>
    </div>
  );
}