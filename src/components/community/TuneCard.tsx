import { useState } from 'react';
import { Heart, Download, Play, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PublicTune, useTuneLike, useTuneDownload } from '@/hooks/usePublicTunes';
import { tuneTypeDescriptions } from '@/lib/tuningCalculator';
import { toast } from 'sonner';

interface TuneCardProps {
  tune: PublicTune;
  onTryTune: (tune: PublicTune) => void;
  onAuthRequired?: () => void;
}

export function TuneCard({ tune, onTryTune, onAuthRequired }: TuneCardProps) {
  const { toggleLike, loading: likeLoading, isAuthenticated } = useTuneLike();
  const { recordDownload } = useTuneDownload();
  const [isLiked, setIsLiked] = useState(tune.isLikedByUser ?? false);
  const [likesCount, setLikesCount] = useState(tune.likesCount);

  const handleLike = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      toast.error('Sign in to like tunes');
      return;
    }

    const newLikedState = await toggleLike(tune.id, isLiked);
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
  };

  const handleTry = () => {
    recordDownload(tune.id);
    onTryTune(tune);
  };

  const tuneTypeInfo = tuneTypeDescriptions[tune.tuneType];

  return (
    <div className="module-block p-4 hover:border-neon-cyan/30 transition-all group">
      {/* Featured badge */}
      {tune.featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-neon-pink text-white shadow-[0_0_10px_hsl(var(--neon-pink)/0.5)]">
            <Star className="w-3 h-3 mr-1" /> Featured
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg truncate text-foreground group-hover:text-neon-cyan transition-colors">
            {tune.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{tune.carName}</p>
        </div>
        <Badge 
          variant="outline" 
          className="ml-2 shrink-0"
          style={{ 
            borderColor: `hsl(var(--module-${tune.tuneType === 'drift' ? 'differential' : tune.tuneType === 'grip' ? 'tires' : tune.tuneType === 'drag' ? 'aero' : 'suspension'}))`,
            color: `hsl(var(--module-${tune.tuneType === 'drift' ? 'differential' : tune.tuneType === 'grip' ? 'tires' : tune.tuneType === 'drag' ? 'aero' : 'suspension'}))`
          }}
        >
          {tuneTypeInfo.title}
        </Badge>
      </div>

      {/* Description */}
      {tune.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {tune.description}
        </p>
      )}

      {/* Creator */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <User className="w-3 h-3" />
        <span className="truncate">{tune.creatorName}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-neon-pink text-neon-pink' : 'text-muted-foreground'}`} />
          <span className={isLiked ? 'text-neon-pink' : 'text-muted-foreground'}>{likesCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Download className="w-4 h-4" />
          <span>{tune.downloadsCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={handleTry}
          className="flex-1 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30"
          size="sm"
        >
          <Play className="w-4 h-4 mr-1" /> Try It
        </Button>
        <Button
          onClick={handleLike}
          disabled={likeLoading}
          variant="outline"
          size="sm"
          className={`px-3 ${isLiked ? 'border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10' : 'border-border hover:bg-card'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
