import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trophy, Icon, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  series: {
    id: string;
    name: string;
  };
  status: string;
  home_score: number | null;
  away_score: number | null;
  round: string;
  tournament_id: string;
  phase_id: string | null;
  group_id: string | null;
  group?: {
    id: string;
    group_name: string;
    group_order: number;
  };
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

interface MatchByGroup {
  groupId: string | null;
  groupName: string;
  groupOrder: number;
  rounds: MatchByRound[];
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
  const [matches, setMatches] = useState<Record<string, MatchByGroup[]>>({});
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Record<string, Array<{id: string, name: string}>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      setSelectedGroup('all'); // Reset group filter when tournament changes
      fetchMatches();
    }
  }, [selectedTournament]);

  useEffect(() => {
    // Reset group filter when series changes
    setSelectedGroup('all');
  }, [selectedSeries]);

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
      // Fetch series first
      const { data: seriesData } = await supabase
        .from('series' as any)
        .select('id, name, position')
        .order('position', { ascending: true });
      
      const seriesMap = new Map((seriesData || []).map((s: any) => [s.id, s.name]));

      // Fetch tournament_series to get only series that belong to this tournament
      const { data: tournamentSeriesData } = await supabase
        .from('tournament_series' as any)
        .select('series_id')
        .eq('tournament_id', selectedTournament);

      const tournamentSeriesIds = new Set((tournamentSeriesData || []).map((ts: any) => ts.series_id));

      // Fetch groups
      const { data: groupsData } = await supabase
        .from('phase_groups' as any)
        .select('id, group_name, group_order, phase_id');

      const groupsMap = new Map((groupsData || []).map((g: any) => [g.id, { id: g.id, group_name: g.group_name, group_order: g.group_order }]));

      const { data, error } = await supabase
        .from('matches' as any)
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .eq('tournament_id', selectedTournament)
        .order('round', { ascending: true });

      if (error) throw error;

      // Add series name and group info to each match
      const matchesWithDetails = (data || []).map((match: any) => ({
        ...match,
        series: {
          id: match.series_id,
          name: seriesMap.get(match.series_id) || 'Unknown'
        },
        group: match.group_id ? groupsMap.get(match.group_id) : null
      }));

      // Filter only series that belong to this tournament and sort them
      const sortedSeries = (seriesData || [])
        .filter((s: any) => tournamentSeriesIds.has(s.id))
        .map((s: any) => s.name);
      
      setAvailableSeries(sortedSeries);
      
      // Set the first series as selected by default if not already set
      if (sortedSeries.length > 0 && !selectedSeries) {
        setSelectedSeries(sortedSeries[0]);
      }

      // Get available groups per series
      const groupsBySeries: Record<string, Array<{id: string, name: string}>> = {};
      matchesWithDetails.forEach((match: any) => {
        const seriesName = match.series?.name || '';
        if (seriesName && match.group) {
          if (!groupsBySeries[seriesName]) {
            groupsBySeries[seriesName] = [];
          }
          const existingGroup = groupsBySeries[seriesName].find(g => g.id === match.group.id);
          if (!existingGroup) {
            groupsBySeries[seriesName].push({
              id: match.group.id,
              name: match.group.group_name
            });
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

      // Group matches by series, then by group, then by round
      const groupedMatches = matchesWithDetails.reduce((acc: any, match: any) => {
        const seriesKey = match.series?.name || 'Unknown';
        
        if (!acc[seriesKey]) {
          acc[seriesKey] = [];
        }

        const groupId = match.group_id || null;
        const groupName = match.group ? match.group.group_name : 'General';
        const groupOrder = match.group ? match.group.group_order : 0;

        let groupData = acc[seriesKey].find((g: any) => g.groupId === groupId);
        if (!groupData) {
          groupData = { 
            groupId, 
            groupName, 
            groupOrder,
            rounds: [] 
          };
          acc[seriesKey].push(groupData);
        }

        let roundData = groupData.rounds.find((r: any) => r.round === match.round);
        if (!roundData) {
          roundData = { round: match.round, matches: [] };
          groupData.rounds.push(roundData);
        }
        
        roundData.matches.push(match);
        return acc;
      }, {} as Record<string, MatchByGroup[]>);

      // Sort groups and rounds within each series
      Object.keys(groupedMatches).forEach(seriesKey => {
        // Sort groups by group_order
        groupedMatches[seriesKey].sort((a, b) => a.groupOrder - b.groupOrder);
        // Sort rounds within each group
        groupedMatches[seriesKey].forEach((group: MatchByGroup) => {
          group.rounds.sort((a, b) => parseInt(a.round) - parseInt(b.round));
        });
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

  const downloadFixturePDF = () => {
    const doc = new jsPDF();
    
    // Get tournament and series names
    const tournament = tournaments.find(t => t.id === selectedTournament);
    const tournamentName = tournament?.name || 'Fixture';
    
    // Title
    doc.setFontSize(18);
    doc.text(`Fixture - ${tournamentName}`, 14, 20);
    
    if (selectedSeries) {
      doc.setFontSize(12);
      doc.text(`Serie: ${selectedSeries}`, 14, 28);
    }
    
    let yPosition = selectedSeries ? 35 : 28;
    
    // Get matches for selected series
    const seriesMatches = matches[selectedSeries] || [];
    
    // Filter by group if selected
    const filteredGroups = selectedGroup === 'all' 
      ? seriesMatches 
      : seriesMatches.filter(g => g.groupId === selectedGroup);
    
    if (filteredGroups.length === 0) {
      doc.setFontSize(10);
      doc.text('No hay partidos para mostrar', 14, yPosition);
      doc.save(`fixture-${tournamentName.replace(/\s+/g, '-')}.pdf`);
      return;
    }
    
    // Process each group
    filteredGroups.forEach((groupData, groupIndex) => {
      if (groupIndex > 0) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Group title
      if (groupData.groupId) {
        doc.setFontSize(14);
        doc.text(groupData.groupName, 14, yPosition);
        yPosition += 8;
      }
      
      // Process each round
      groupData.rounds.forEach((roundData) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Round title
        doc.setFontSize(12);
        doc.text(`Jornada ${roundData.round}`, 14, yPosition);
        yPosition += 5;
        
        // Create table data for matches
        const tableData = roundData.matches.map(match => [
          match.match_date ? formatDate(match.match_date) : '',
          match.match_time || '',
          toTitleCase(match.home_team.name),
          match.status === 'completed' 
            ? `${match.home_score} - ${match.away_score}` 
            : 'vs',
          toTitleCase(match.away_team.name),
          match.venue || ''
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Fecha', 'Hora', 'Local', '', 'Visitante', 'Cancha']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 45 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 45 },
            5: { cellWidth: 35 }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });
    });
    
    // Save PDF
    const fileName = selectedGroup !== 'all' && filteredGroups[0]?.groupName
      ? `fixture-${tournamentName}-${selectedSeries}-${filteredGroups[0].groupName}.pdf`
      : `fixture-${tournamentName}-${selectedSeries}.pdf`;
    
    doc.save(fileName.replace(/\s+/g, '-'));
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
              <SelectContent className="bg-background z-50">
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
          <Tabs 
            value={selectedSeries || availableSeries[0]} 
            onValueChange={(value) => {
              setSelectedSeries(value);
              setSelectedGroup('all'); // Reset group when switching series
            }}
            className="w-full"
          >
            <TabsList className={`grid w-full mb-8 ${availableSeries.length === 1 ? 'grid-cols-1' : availableSeries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {availableSeries.map((serie) => (
                <TabsTrigger 
                  key={serie} 
                  value={serie} 
                  className="text-sm"
                >
                  {serie}
                </TabsTrigger>
              ))}
            </TabsList>

          {availableSeries.map((serie) => (
            <TabsContent key={serie} value={serie}>
              <div className="mb-6 flex flex-col sm:flex-row justify-center gap-4">
                {/* Group Filter - Only show if this series has groups */}
                {availableGroups[serie] && availableGroups[serie].length > 0 && (
                  <div className="w-full sm:w-64">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un grupo" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">Todos los grupos</SelectItem>
                        {availableGroups[serie].map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Download PDF Button */}
                <Button 
                  onClick={downloadFixturePDF}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>

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
                    const filteredGroups = matches[serie].filter(groupData => 
                      selectedGroup === 'all' || groupData.groupId === selectedGroup
                    );
                    
                    return filteredGroups.length > 0 ? (
                      <div className="space-y-8">
                        {filteredGroups.map((groupData) => (
                          <div key={groupData.groupId || 'general'}>
                            {groupData.groupId && (
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                {groupData.groupName}
                              </h3>
                            )}
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                              {groupData.rounds.map((roundData) => (
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="football-card">
                        <CardContent className="text-center py-12">
                          <SoccerBallIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No hay partidos para este grupo</h3>
                          <p className="text-muted-foreground">
                            No se encontraron partidos para el grupo seleccionado en la serie {serie}
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