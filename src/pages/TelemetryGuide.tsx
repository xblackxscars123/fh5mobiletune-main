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
  { id: 'cheatsheet', label: 'Master Cheat Sheet', icon: Wrench },
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

              <section id="workflow" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Telemetry Workflow Tips</h2>
                  <p className="text-muted-foreground">
                    Best practices for using telemetry effectively in your tuning sessions.
                  </p>
                </div>
                <WorkflowTips />
              </section>

              <section id="cheatsheet" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Master Cheat Sheet</h2>
                  <p className="text-muted-foreground">
                    Quick reference for building competitive tunes and understanding hidden mechanics.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-4">
                    <h3 className="text-lg font-semibold">Phase 1: Build Strategy</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Transmission Strategy</div>
                        <div className="text-sm text-muted-foreground">Sport Transmission: Use for A-Class and below to save PI.</div>
                        <div className="text-sm text-muted-foreground">Race Transmission: Mandatory for Drifting or S2 Class.</div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Aerodynamics (The PI Tax)</div>
                        <div className="text-sm text-muted-foreground">Front Splitter (Adjustable): Always install on A-Class and above.</div>
                        <div className="text-sm text-muted-foreground">Rear Wing: Power builds leave stock, grip builds install race wing.</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-4">
                    <h3 className="text-lg font-semibold">Phase 2: The Calculations (Base Tune)</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Suspension Frequency</div>
                        <div className="text-sm text-muted-foreground">Road/Race: 2.5–3.0 Hz. Rally/Offroad: 1.5–2.0 Hz.</div>
                        <div className="text-xs font-mono text-foreground/80 break-all">
                          Spring Rate (N/mm) = (Weight (kg) × Distribution % × Frequency²) × 0.004
                        </div>
                        <div className="text-sm text-muted-foreground">Shortcut: Front ≈ Total Weight × Front % • Rear ≈ Total Weight × Rear %</div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Damping (Pack Rule)</div>
                        <div className="text-sm text-muted-foreground">Rebound: Spring Rate × 0.15 or (Weight × Distribution %) ÷ 20.</div>
                        <div className="text-sm text-muted-foreground">Bump: 50–75% of Rebound.</div>
                        <div className="text-sm text-muted-foreground">Curbs launch: Rebound too stiff. Bottoms out: Bump too soft.</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                      <div className="text-sm font-semibold">Anti-Roll Bars (AWD Exploit)</div>
                      <div className="text-sm text-muted-foreground">AWD Meta: Front 1, Rear 65 for rotation.</div>
                      <div className="text-sm text-muted-foreground">RWD/FWD Start: Front 25, Rear 35 balanced.</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-4">
                    <h3 className="text-lg font-semibold">Phase 3: Geometry (Alignment)</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Camber & Temp Delta</div>
                        <div className="text-sm text-muted-foreground">Inside tire temp 5–10°F hotter mid-corner.</div>
                        <div className="text-sm text-muted-foreground">Inside &gt;20°F hotter: too much camber. Outside hotter: too little.</div>
                        <div className="text-sm text-muted-foreground">Meta: ~-1.5° camber and high caster.</div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Toe (Turn-In)</div>
                        <div className="text-sm text-muted-foreground">Front: Race 0.1 out. Drift 5.0 out.</div>
                        <div className="text-sm text-muted-foreground">Rear: Always 0.0 to avoid drag.</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                      <div className="text-sm font-semibold">Caster (Magic 7)</div>
                      <div className="text-sm text-muted-foreground">Meta: 7.0° for dynamic camber and straight-line grip.</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-4">
                    <h3 className="text-lg font-semibold">Phase 4: Control & Feel</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Braking (Inverted Logic)</div>
                        <div className="text-sm text-muted-foreground">Balance: 45–48% rear bias.</div>
                        <div className="text-sm text-muted-foreground">Drift hack: 0% (all front) to pivot.</div>
                        <div className="text-sm text-muted-foreground">Pressure: ABS on 100%, ABS off 130–150%.</div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2">
                        <div className="text-sm font-semibold">Gearing (Lazy Hack)</div>
                        <div className="text-sm text-muted-foreground">Sport: Move Final Drive toward Speed, then back slightly.</div>
                        <div className="text-sm text-muted-foreground">Race: 1st long enough to prevent spin, Final hits redline on longest straight.</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-4">
                    <h3 className="text-lg font-semibold">Phase 5: Differential (Power Delivery)</h3>
                    <div className="grid gap-3">
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-2 text-sm text-muted-foreground">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-foreground font-semibold">
                          <div>Car Type</div>
                          <div>Accel</div>
                          <div>Decel</div>
                          <div>Center</div>
                          <div>Notes</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div className="text-foreground">RWD Road</div>
                          <div>50–70%</div>
                          <div>15–30%</div>
                          <div>N/A</div>
                          <div>Higher accel for even push, low decel for turn-in.</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div className="text-foreground">AWD Road</div>
                          <div>F 15% / R 75%</div>
                          <div>F 0% / R 25%</div>
                          <div>65–75%</div>
                          <div>Center &gt;65% sends power rear for rotation.</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div className="text-foreground">Rally/Offroad</div>
                          <div>F 50% / R 90%</div>
                          <div>F 0% / R 50%</div>
                          <div>50%</div>
                          <div>High lock keeps power down on loose surfaces.</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div className="text-foreground">Drift</div>
                          <div>100%</div>
                          <div>100%</div>
                          <div>N/A</div>
                          <div>Always locked for consistent sliding.</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/20 border border-border/50 space-y-1 text-sm text-muted-foreground">
                        <div className="text-foreground font-semibold">Logic Pearls</div>
                        <div>RWD Accel: Higher (70%) often improves grip. If exit spin, lower it.</div>
                        <div>RWD Decel: Keep 15–30%. 0% helps rotation.</div>
                        <div>AWD Center: 65–75% is the oversteer slider. 100% is RWD with front drag.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

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
