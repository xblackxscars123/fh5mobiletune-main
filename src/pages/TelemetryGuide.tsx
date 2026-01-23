import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, BookOpen, Wrench, HelpCircle, Lightbulb, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SetupTabs } from '@/components/guide/SetupTabs';
import { TelemetryDataCard } from '@/components/guide/TelemetryDataCard';
import { IssueFixTable } from '@/components/guide/IssueFixTable';
import { GlossaryAccordion } from '@/components/guide/GlossaryAccordion';
import { WorkflowTips } from '@/components/guide/WorkflowTips';
import { JDMStickerBombBackground } from '@/components/JDMStickerBombBackground';
import { telemetryMetrics } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'intro', label: 'Introduction', icon: Radio },
  { id: 'setup', label: 'Setup Guide', icon: Wrench },
  { id: 'data', label: 'Understanding Data', icon: BookOpen },
  { id: 'issues', label: 'Issues & Fixes', icon: HelpCircle },
  { id: 'workflow', label: 'Workflow Tips', icon: Lightbulb },
  { id: 'glossary', label: 'Glossary', icon: BookOpen },
];

export default function TelemetryGuide() {
  const [activeSection, setActiveSection] = useState('intro');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <JDMStickerBombBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tuner
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h1 className="font-display text-xl font-bold">Telemetry Guide</h1>
              </div>
            </div>

            {/* Mobile nav toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors',
                        activeSection === section.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Mobile Navigation Overlay */}
            {mobileNavOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
                <div className="absolute top-16 left-4 right-4 bg-card border border-border rounded-lg p-4 space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                          activeSection === section.id
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-4xl space-y-16">
              {/* Introduction */}
              <section id="intro" className="scroll-mt-24 space-y-6">
                <div className="space-y-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Live Data Integration
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold">
                    Real-Time Telemetry from Forza Horizon 5
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Connect your game to PRO TUNER and see exactly what your car is doing while you drive. 
                    Validate your tunes with real data instead of guessing.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <Radio className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">What is Telemetry?</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time data streamed from your car: suspension travel, tire temps, G-forces, and more.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <Wrench className="w-8 h-8 text-racing-cyan mb-3" />
                    <h3 className="font-semibold mb-1">Why Use It?</h3>
                    <p className="text-sm text-muted-foreground">
                      See if your tune actually works. Spot issues like bottoming out or overheating tires instantly.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <Lightbulb className="w-8 h-8 text-warning mb-3" />
                    <h3 className="font-semibold mb-1">Data-Driven Tuning</h3>
                    <p className="text-sm text-muted-foreground">
                      Stop guessing. Make adjustments based on what the telemetry tells you.
                    </p>
                  </div>
                </div>
              </section>

              {/* Setup Guide */}
              <section id="setup" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Setup Guide</h2>
                  <p className="text-muted-foreground">
                    Follow the instructions for your platform to connect FH5 telemetry to PRO TUNER.
                  </p>
                </div>
                <SetupTabs />
              </section>

              {/* Understanding Data */}
              <section id="data" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Understanding Telemetry Data</h2>
                  <p className="text-muted-foreground">
                    Learn what each metric means and how to interpret the readings.
                  </p>
                </div>
                <div className="grid gap-6">
                  {telemetryMetrics.map((metric) => (
                    <TelemetryDataCard key={metric.id} metric={metric} />
                  ))}
                </div>
              </section>

              {/* Issues & Fixes */}
              <section id="issues" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Common Issues & Fixes</h2>
                  <p className="text-muted-foreground">
                    Quick reference for solving common tune problems identified through telemetry.
                  </p>
                </div>
                <IssueFixTable />
              </section>

              {/* Workflow Tips */}
              <section id="workflow" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Telemetry Workflow Tips</h2>
                  <p className="text-muted-foreground">
                    Best practices for using telemetry effectively in your tuning sessions.
                  </p>
                </div>
                <WorkflowTips />
              </section>

              {/* Glossary */}
              <section id="glossary" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Tuning Glossary</h2>
                  <p className="text-muted-foreground">
                    Definitions of common tuning terms and concepts.
                  </p>
                </div>
                <GlossaryAccordion />
              </section>

              {/* Footer */}
              <footer className="pt-8 pb-16 border-t border-border/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Need help? Join our community for support.
                  </p>
                  <Link to="/">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Tuner
                    </Button>
                  </Link>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
