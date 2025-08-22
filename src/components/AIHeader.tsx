import { Brain, Sparkles } from "lucide-react";

export const AIHeader = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse" />
      <div className="relative container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-bounce" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Resume Intelligence
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Career Analysis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">AI Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};