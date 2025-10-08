import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { AlertTriangle, Users, Calendar } from "lucide-react";

interface SuspendedPlayer {
  id: string;
  name: string;
  team: string;
  series: string;
  remaining_matches: number;
  reason: string;
}

export default function Tribunal() {
  const [suspendedPlayers, setSuspendedPlayers] = useState<SuspendedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspendedPlayers();
  }, []);

  const fetchSuspendedPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('suspended_players')
        .select('*, teams(name)')
        .gt('remaining_matches', 0)
        .order('remaining_matches', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map((player: any) => ({
        id: player.id,
        name: player.name,
        team: player.teams?.name || 'Sin equipo',
        series: player.series,
        remaining_matches: player.remaining_matches,
        reason: player.reason
      }));
      
      setSuspendedPlayers(formattedData);
    } catch (error) {
      console.error('Error fetching suspended players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeriesColor = (series: string) => {
    switch (series) {
      case 'Adultos':
      case 'Adultos A':
      case 'Adultos B':
        return 'bg-primary text-primary-foreground';
      case 'Senior':
        return 'bg-accent text-accent-foreground';
      case 'Super Senior':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (matches: number) => {
    if (matches >= 5) return 'bg-red-500 text-white';
    if (matches >= 3) return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-black';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mr-4" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Tribunal
            </h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Lista de jugadores suspendidos por expulsiones. Aquí se muestran las fechas 
            de suspensión restantes para cada jugador.
          </p>
        </div>

        <Card className="football-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Jugadores Suspendidos</span>
              {suspendedPlayers.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {suspendedPlayers.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 animate-pulse">
                    <div className="h-8 bg-muted rounded flex-1"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : suspendedPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jugador</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Serie</TableHead>
                      <TableHead className="text-center">Fechas Restantes</TableHead>
                      <TableHead className="hidden md:table-cell">Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspendedPlayers.map((player) => (
                      <TableRow key={player.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {player.name}
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {player.team}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeriesColor(player.series)}>
                            {['Adultos A', 'Adultos B'].includes(player.series) ? 'Adultos' : player.series}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getSeverityColor(player.remaining_matches)}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {player.remaining_matches} {player.remaining_matches === 1 ? 'fecha' : 'fechas'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {player.reason || 'No especificado'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-4">
                    <AlertTriangle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  ¡Excelente Disciplina!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Actualmente no hay jugadores suspendidos. Todos nuestros jugadores 
                  están manteniendo un comportamiento ejemplar en la cancha.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Suspensiones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-muted-foreground">Fair Play</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">🏆</div>
                    <div className="text-sm text-muted-foreground">Disciplina</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Leyenda de Severidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-500 text-black">1-2 fechas</Badge>
                <span className="text-sm text-muted-foreground">Suspensión leve</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-500 text-white">3-4 fechas</Badge>
                <span className="text-sm text-muted-foreground">Suspensión moderada</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-500 text-white">5+ fechas</Badge>
                <span className="text-sm text-muted-foreground">Suspensión severa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}