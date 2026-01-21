import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Book, Search, Cog, Circle, GitMerge, Compass, Gauge } from 'lucide-react';
import { glossaryTerms, GlossaryTerm } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  suspension: { icon: <Cog className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Suspension' },
  tires: { icon: <Circle className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Tires' },
  differential: { icon: <GitMerge className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Differential' },
  alignment: { icon: <Compass className="w-3 h-3" />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Alignment' },
  general: { icon: <Gauge className="w-3 h-3" />, color: 'bg-muted text-muted-foreground border-muted', label: 'General' },
};

export function GlossaryAccordion() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesSearch = 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['suspension', 'tires', 'differential', 'alignment', 'general'];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5 text-primary" />
          Tuning Glossary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border/50"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                'cursor-pointer transition-colors',
                !selectedCategory 
                  ? 'bg-primary/20 text-primary border-primary/50' 
                  : 'hover:bg-primary/10'
              )}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-colors flex items-center gap-1',
                    selectedCategory === cat ? config.color : 'hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  {config.icon}
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No terms found matching "{searchQuery}"
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {filteredTerms.map((term, idx) => {
              const config = categoryConfig[term.category];
              return (
                <AccordionItem
                  key={idx}
                  value={`term-${idx}`}
                  className="border border-border/50 rounded-lg bg-background/30 px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        {config.icon}
                      </Badge>
                      <span className="font-medium text-foreground">{term.term}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {term.definition}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          {filteredTerms.length} of {glossaryTerms.length} terms shown
        </p>
      </CardContent>
    </Card>
  );
}
