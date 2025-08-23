import { Shield, Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-card/80 backdrop-blur-lg border-b cyber-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary cyber-glow" />
            <div>
              <h1 className="text-xl font-bold text-foreground">CyberShield AI</h1>
              <p className="text-xs text-muted-foreground">Digital Sovereignty Protection</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#scanner" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Scanner
              </a>
              <a href="#protection" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Protection
              </a>
              <a href="#reports" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Reports
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;