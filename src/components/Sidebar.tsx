import { Link, useLocation } from "react-router-dom";
import { Home, Target, BookOpen, Heart, Sprout, Activity, Scale, Wrench, Boxes, MapPin, Calendar, Compass, Users, Shield, Trophy, PlusCircle, History } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "My Homestead",
    items: [
      { title: "Overview", href: "/dashboard", icon: Home },
      { title: "Log Action", href: "/log", icon: PlusCircle },
      { title: "Praxis Timeline", href: "/timeline", icon: History },
      { title: "Goals", href: "/goals", icon: Target },
      { title: "Journal", href: "/journal", icon: BookOpen },
      { title: "Achievements", href: "/achievements", icon: Trophy },
    ],
  },
  {
    title: "Planning Tools",
    items: [
      { title: "Breeding Tracker", href: "/breeding", icon: Heart },
      { title: "Crop Planner", href: "/crop-planner", icon: Sprout },
      { title: "Health Hub", href: "/animals", icon: Activity },
      { title: "Homestead Balance", href: "/finance", icon: Scale },
      { title: "Infrastructure", href: "/infrastructure", icon: Wrench },
      { title: "Inventory Management", href: "/inventory", icon: Boxes },
      { title: "Property Assessment", href: "/property", icon: MapPin },
      { title: "Seasonal Calendar", href: "/calendar", icon: Calendar },
      { title: "Strategic Planner", href: "/strategic-planning", icon: Compass },
    ],
  },
  {
    title: "Community",
    items: [
      { title: "Community Forum", href: "https://www.skool.com/billybs-backyard-freedom-hub-4823/about?ref=b69230eadf3c43fb9f6bb40527c4698d", icon: Users, external: true },
    ],
  },
];

const adminSection = {
  title: "Administration",
  items: [
    { title: "User Management", href: "/admin/users", icon: Shield },
  ],
};

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user, profile } = useAuth();

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User';

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="text-xl font-bold text-foreground">
          Praxis
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                if (item.external) {
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Admin Section - Only visible to admin users */}
        {profile?.role === 'admin' && (
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {adminSection.title}
            </h3>
            <nav className="space-y-1">
              {adminSection.items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-border py-4 px-4">
        <Link to="/profile" className="block">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
