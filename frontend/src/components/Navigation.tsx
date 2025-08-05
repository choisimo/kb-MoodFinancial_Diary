import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  User,
  Menu,
  X,
  Calendar,
  Search,
  LogOut
} from "lucide-react";

interface NavigationProps {
  currentView: "dashboard" | "timeline" | "new-diary" | "analytics" | "settings";
  onViewChange: (view: "dashboard" | "timeline" | "new-diary" | "analytics" | "settings") => void;
  unreadCount?: number;
}

export function Navigation({ currentView, onViewChange, unreadCount = 0 }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard" as const,
      label: "대시보드",
      icon: Home,
      badge: null
    },
    {
      id: "timeline" as const,
      label: "일기 목록",
      icon: BookOpen,
      badge: null
    },
    {
      id: "new-diary" as const,
      label: "새 일기",
      icon: PlusCircle,
      badge: null
    },
    {
      id: "analytics" as const,
      label: "분석",
      icon: BarChart3,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      id: "settings" as const,
      label: "설정",
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (viewId: typeof currentView) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 모바일 헤더 */}
      <div className="lg:hidden bg-diary-paper border-b border-diary-border shadow-card sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
              📖
            </div>
            <h1 className="text-lg font-semibold text-diary-ink">내 일기장</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-16 w-64 h-full bg-diary-paper border-l border-diary-border shadow-xl">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavClick(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
              
              <div className="pt-2 border-t border-diary-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  로그아웃
                </Button>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-diary-border">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user?.nickname?.charAt(0)?.toUpperCase() || '😊'}
                </div>
                <div>
                  <div className="font-medium text-diary-ink">{user?.nickname || '사용자'}</div>
                  <div className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-0 lg:h-full bg-diary-paper border-r border-diary-border shadow-card">
        {/* 로고 및 제목 */}
        <div className="p-6 border-b border-diary-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
              📖
            </div>
            <div>
              <h1 className="text-xl font-bold text-diary-ink">내 일기장</h1>
              <p className="text-sm text-muted-foreground">Personal Diary</p>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className="w-full justify-start text-left h-12"
              onClick={() => handleNavClick(item.id)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          <div className="pt-2 border-t border-diary-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-12 text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="flex-1">로그아웃</span>
            </Button>
          </div>
        </nav>

        {/* 사용자 프로필 */}
        <div className="p-4 border-t border-diary-border">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-diary-border hover:shadow-soft transition-smooth cursor-pointer">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.nickname?.charAt(0)?.toUpperCase() || '😊'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-diary-ink truncate">{user?.nickname || '사용자'}</div>
              <div className="text-sm text-muted-foreground truncate">{user?.email || 'user@example.com'}</div>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 하단 탭 바 (모바일) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-diary-paper border-t border-diary-border shadow-card z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              className="flex-col h-12 text-xs relative"
              onClick={() => handleNavClick(item.id)}
            >
              <item.icon className="w-4 h-4 mb-1" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}