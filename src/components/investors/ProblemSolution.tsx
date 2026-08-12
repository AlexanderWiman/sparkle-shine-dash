import { Droplets, AlertTriangle } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
            The Problem
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            The car wash industry has a water problem.
          </h2>
          <p className="text-lg text-muted-foreground">
            A single conventional car wash can consume more water than a household uses in a day —
            often laced with petrochemical detergents that flow straight into storm drains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Traditional */}
          <div className="bg-card rounded-2xl border border-destructive/20 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-destructive/5 rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Traditional Car Wash</h3>
            </div>
            <div className="space-y-4 relative">
              <div>
                <div className="text-5xl font-bold text-destructive mb-1">150+ L</div>
                <div className="text-sm text-muted-foreground">Water per wash</div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Droplets key={i} className="h-5 w-5 text-destructive/60" />
                ))}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pt-3 border-t border-border">
                <li>• Heavy chemical runoff</li>
                <li>• High utility costs</li>
                <li>• Permits restricted in drought regions</li>
              </ul>
            </div>
          </div>

          {/* Car Washap */}
          <div className="bg-card rounded-2xl border-2 border-primary/30 p-8 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Car Washap</h3>
            </div>
            <div className="space-y-4 relative">
              <div>
                <div className="text-5xl font-bold text-primary mb-1">5–10 L</div>
                <div className="text-sm text-muted-foreground">Water per wash</div>
              </div>
              <div className="flex gap-1">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pt-3 border-t border-border">
                <li>• Biodegradable, eco-certified products</li>
                <li>• Drought-compatible operations</li>
                <li>• Lower opex, faster facility ROI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
