import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target, History, Award, Heart } from "lucide-react";

interface ClubInfo {
  section: string;
  title: string;
  content: string;
}

export default function About() {
  const [clubInfo, setClubInfo] = useState<Record<string, ClubInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('club_info')
        .select('*');

      if (error) throw error;

      const infoMap = (data || []).reduce((acc, info) => {
        acc[info.section] = info;
        return acc;
      }, {} as Record<string, ClubInfo>);

      setClubInfo(infoMap);
    } catch (error) {
      console.error('Error fetching club info:', error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    "Campeones Liga Local 2023",
    "Subcampeones Copa Regional 2022", 
    "Campeones Liga Local 2021",
    "Campeones Liga Local 2020",
    "Subcampeones Copa Regional 2019"
  ];

  const stats = [
    { label: "Años de Historia", value: "15+", icon: History },
    { label: "Series Activas", value: "3", icon: Users },
    { label: "Equipos", value: "4", icon: Trophy },
    { label: "Títulos Ganados", value: "8", icon: Award },
    { label: "Jugadores", value: "80+", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Club Logo" 
              className="h-24 w-auto shadow-glow"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Quiénes Somos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conoce la historia, valores y logros que han forjado nuestro club a lo largo de los años
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center football-card">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Historia */}
          <Card className="football-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <span>Nuestra Historia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {clubInfo.history?.content || 
                    "Nuestro club fue fundado con la pasión por el fútbol y el espíritu de competencia. A lo largo de los años, hemos crecido hasta convertirnos en una institución respetada en el fútbol local, manteniendo siempre nuestros valores de fair play y compañerismo."
                  }
                </p>
              )}
            </CardContent>
          </Card>

          {/* Misión y Visión */}
          <Card className="football-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Misión y Visión</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {clubInfo.mission?.content || 
                    "Promover el deporte del fútbol en todas las edades, fomentando los valores de respeto, trabajo en equipo y fair play. Buscamos ser un referente en el desarrollo integral de nuestros jugadores tanto dentro como fuera de la cancha."
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Palmarés */}
        <Card className="football-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Palmarés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2 animate-pulse">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  {clubInfo.achievements?.content || 
                    "A lo largo de nuestra trayectoria, hemos logrado importantes triunfos que nos enorgullecen y nos motivan a seguir creciendo."
                  }
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                      <Award className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nuestras Series */}
        <Card className="football-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Nuestras Series</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Nuestro club compite en 3 series: Adultos, Senior y Super Senior, con 4 equipos en total:
              <br />
              <strong>Adultos:</strong> CD Manuel Montt A y CD Manuel Montt B<br />
              <strong>Senior:</strong> CD Manuel Montt<br />
              <strong>Super Senior:</strong> CD Manuel Montt<br />
              Todos los equipos representan a la misma institución en distintas categorías de edad.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <h4 className="font-medium">Serie Adultos A</h4>
                    <p className="text-sm text-muted-foreground">Mayores de 18 años - Equipo principal</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Primera División</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div>
                    <h4 className="font-medium">Serie Adultos B</h4>
                    <p className="text-sm text-muted-foreground">Mayores de 18 años - Segundo equipo</p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">Primera División</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div>
                    <h4 className="font-medium">Serie Senior</h4>
                    <p className="text-sm text-muted-foreground">Mayores de 29 años</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">Liga Senior</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Serie Super Senior</h4>
                    <p className="text-sm text-muted-foreground">Mayores de 40 años</p>
                  </div>
                  <Badge variant="secondary">Liga Veteranos</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}