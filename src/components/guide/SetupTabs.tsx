import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Monitor, Gamepad2, Smartphone, Copy, Check, AlertTriangle, Download } from 'lucide-react';
import { platformSetups } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
};

export function SetupTabs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Tabs defaultValue="pc" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50">
        {platformSetups.map((platform) => (
          <TabsTrigger
            key={platform.id}
            value={platform.id}
            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            {iconMap[platform.icon]}
            <span className="hidden sm:inline">{platform.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {platformSetups.map((platform) => (
        <TabsContent key={platform.id} value={platform.id} className="mt-6 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {iconMap[platform.icon]}
                {platform.name}
              </CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup Steps */}
              <div className="space-y-4">
                {platform.steps.map((step) => (
                  <div
                    key={step.step}
                    className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-l-transparent"
                  >
                    {/* Step Number */}
                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>

                      {step.code && (
                        <div className="relative mt-2">
                          <pre className="bg-background/80 border border-border/50 rounded-lg p-3 pr-12 text-sm font-mono text-racing-cyan overflow-x-auto">
                            {step.code}
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={() => copyToClipboard(step.code!, `${platform.id}-${step.step}`)}
                          >
                            {copiedCode === `${platform.id}-${step.step}` ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}

                      {step.note && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-primary">{step.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Button for PC */}
              {platform.id === 'pc' && (
                <div className="flex justify-center pt-4">
                  <Button className="gap-2" size="lg">
                    <Download className="w-5 h-5" />
                    Download Relay Server
                  </Button>
                </div>
              )}

              {/* Troubleshooting */}
              <div className="pt-4 border-t border-border/50">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Troubleshooting
                </h4>
                <Accordion type="single" collapsible className="space-y-2">
                  {platform.troubleshooting.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`trouble-${idx}`}
                      className="border border-border/50 rounded-lg bg-background/50 px-4"
                    >
                      <AccordionTrigger className="text-sm hover:no-underline">
                        {item.problem}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.solution}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
