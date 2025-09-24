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
  team: {
    name: string;
  };
}

const series = ['Adultos', 'Senior', 'Super Senior'];

export default function Standings() {
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('standings')
        .select(`
          *,
          team:team_id(name)
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      // Group by series, merging Adultos A and B into 'Adultos'
      const groupedStandings = (data || []).reduce((acc, standing) => {
        let key = standing.series;
        if (key === 'Adultos A' || key === 'Adultos B') {
          key = 'Adultos';
        }
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(standing);
        return acc;
      }, {} as Record<string, Standing[]>);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Tabla de Posiciones
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sigue el rendimiento de todos nuestros equipos
          </p>
        </div>

  <Tabs defaultValue="Adultos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            {series.map((serie) => (
              <TabsTrigger key={serie} value={serie} className="text-sm">
                {serie}
              </TabsTrigger>
            ))}
          </TabsList>

          {series.map((serie) => (
            <TabsContent key={serie} value={serie}>
              <Card className="football-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>Serie {serie}</span>
                    {serie === 'Adultos' && (
                      <span className="ml-2 text-xs text-muted-foreground">(CD Manuel Montt A y B)</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
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
                  ) : standings[serie] && standings[serie].length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Pos</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead className="text-center w-16">PJ</TableHead>
                            <TableHead className="text-center w-16">PG</TableHead>
                            <TableHead className="text-center w-16">PE</TableHead>
                            <TableHead className="text-center w-16">PP</TableHead>
                            <TableHead className="text-center w-16">GF</TableHead>
                            <TableHead className="text-center w-16">GC</TableHead>
                            <TableHead className="text-center w-16">DG</TableHead>
                            <TableHead className="text-center w-16">Pts</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standings[serie].map((standing) => (
                            <TableRow key={standing.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs ${getPositionBadge(standing.position)}`}>
                                    {standing.position}
                                  </Badge>
                                  {getPositionIcon(standing.position)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {standing.team?.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.matches_played}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.wins}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.draws}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.losses}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.goals_for}
                              </TableCell>
                              <TableCell className="text-center">
                                {standing.goals_against}
                              </TableCell>
                              <TableCell className="text-center">
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
                              <TableCell className="text-center font-bold text-primary">
                                {standing.points}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                      <p className="text-muted-foreground">
                        Las posiciones de la serie {serie} se actualizarán pronto
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}