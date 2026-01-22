import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download, Trophy, Target, Wind, Mountain, Gauge, Zap, Star } from 'lucide-react';
import { CuratedTune } from '@/data/curatedTunes';
import { cn } from '@/lib/utils';

interface FeaturedTuneCardProps {
  tune: CuratedTune;
  onTryTune: (tune: CuratedTune) => void;
  onAuthRequired?: () => void;
  isAuthenticated?: boolean;
}

const tuneTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  grip: { icon: Target, label: 'GRIP', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  drift: { icon: Wind, label: 'DRIFT', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  rally: { icon: Mountain, label: 'RALLY', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  offroad: { icon: Mountain, label: 'OFFROAD', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  drag: { icon: Gauge, label: 'DRAG', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  street: { icon: Zap, label: 'STREET', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400' },
  advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400' },
};

export function FeaturedTuneCard({ tune, onTryTune, onAuthRequired, isAuthenticated = false }: FeaturedTuneCardProps) {
  const typeConfig = tuneTypeConfig[tune.tuneType] || tuneTypeConfig.grip;
  const TypeIcon = typeConfig.icon;
  const diffConfig = difficultyConfig[tune.difficulty];

  const handleTryTune = () => {
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }
    onTryTune(tune);
  };

  return (
    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 min-w-[280px] max-w-[320px] flex-shrink-0">
      {/* Editor's Pick Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-white border-0 shadow-lg">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Editor's Pick
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Type & PI Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("flex items-center gap-1", typeConfig.color)}>
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            {tune.piClass}
          </Badge>
          <Badge variant="outline" className={diffConfig.color}>
            {diffConfig.label}
          </Badge>
        </div>

        {/* Car Name */}
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {tune.carName}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Trophy className="w-3 h-3" />
            {tune.source}
          </p>
        </div>

        {/* Editor Note */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {tune.editorNote}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tune.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 hover:bg-muted">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-400" />
              {tune.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4 text-blue-400" />
              {tune.downloadsCount}
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={handleTryTune}
            className="bg-primary hover:bg-primary/90"
          >
            Try It
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
