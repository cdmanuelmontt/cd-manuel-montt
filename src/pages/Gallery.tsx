import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Images, Eye, Calendar } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  series: string;
  match_date: string;
  image_url: string;
  description: string;
}

const series = ['Adultos', 'Senior', 'Super Senior'];

export default function Gallery() {
  const [images, setImages] = useState<Record<string, GalleryImage[]>>({});
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by series, merging Adultos A and B into 'Adultos'
      const groupedImages = (data || []).reduce((acc, image) => {
        let key = image.series;
        if (key === 'Adultos A' || key === 'Adultos B') {
          key = 'Adultos';
        }
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(image);
        return acc;
      }, {} as Record<string, GalleryImage[]>);

      setImages(groupedImages);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
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

  const groupImagesByDate = (seriesImages: GalleryImage[]) => {
    return seriesImages.reduce((acc, image) => {
      if (!acc[image.match_date]) {
        acc[image.match_date] = [];
      }
      acc[image.match_date].push(image);
      return acc;
    }, {} as Record<string, GalleryImage[]>);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Galería
            </h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Revive los mejores momentos de nuestros partidos
          </p>
        </div>

  <Tabs defaultValue="Adultos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {series.map((serie) => (
              <TabsTrigger key={serie} value={serie} className="text-sm">
                {serie}
              </TabsTrigger>
            ))}
          </TabsList>

          {series.map((serie) => (
            <TabsContent key={serie} value={serie}>
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-muted rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : images[serie] && images[serie].length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupImagesByDate(images[serie])).map(([date, dateImages]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">{date}</h3>
                        <Badge className={getSeriesColor(serie)}>
                          {dateImages.length} {dateImages.length === 1 ? 'imagen' : 'imágenes'}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {dateImages.map((image) => (
                          <Card key={image.id} className="football-card cursor-pointer group">
                            <div className="relative overflow-hidden rounded-t-lg">
                              <img
                                src={image.image_url}
                                alt={image.title || 'Imagen del partido'}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  onClick={() => setSelectedImage(image)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-medium text-sm mb-1">
                                {image.title || 'Sin título'}
                              </h4>
                              {image.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {image.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-16">
                  <CardContent>
                    <Images className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No hay imágenes disponibles</h3>
                    <p className="text-muted-foreground mb-6">
                      Las fotos de la serie {serie} se subirán después de cada partido
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">📸</div>
                        <div className="text-sm text-muted-foreground">Próximamente</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">⚽</div>
                        <div className="text-sm text-muted-foreground">Mejores momentos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedImage?.title || 'Imagen del partido'}</span>
                <Badge className={selectedImage ? getSeriesColor(selectedImage.series) : ''}>
                  {selectedImage?.series} - {selectedImage?.match_date}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title || 'Imagen del partido'}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {selectedImage.description && (
                  <p className="text-muted-foreground text-center">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}