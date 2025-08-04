import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { Timeline } from "@/components/Timeline";
import { DiaryForm } from "@/components/DiaryForm";
import { Settings } from "@/components/Settings";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntry, DiaryFormData } from "@/types/diary";

// 임시 데이터 - 실제로는 API나 데이터베이스에서 가져올 예정
const mockDiaryEntries: DiaryEntry[] = [
  {
    id: "1",
    title: "첫 번째 일기",
    content: "오늘은 새로운 일기 앱을 만들기 시작했다. React와 TypeScript를 사용해서 개인 일기장을 만드는 것이 목표다. 디자인도 예쁘게 나와서 기분이 좋다!",
    date: "2024-08-04",
    mood: "happy",
    location: "집",
    tags: ["개발", "일기장", "React"],
    expenses: 15000,
    images: []
  },
  {
    id: "2", 
    title: "카페에서 작업한 하루",
    content: "오늘은 카페에서 작업했다. 집중이 잘 돼서 많은 진전이 있었다. 아메리카노 한 잔으로 하루 종일 버텼는데 생각보다 괜찮았다.",
    date: "2024-08-03",
    mood: "neutral",
    location: "스타벅스",
    tags: ["카페", "작업", "집중"],
    expenses: 4500,
    images: []
  },
  {
    id: "3",
    title: "친구들과 만난 즐거운 저녁",
    content: "오랜만에 친구들과 만나서 맛있는 음식을 먹었다. 삼겹살집에서 많이 웃고 얘기했다. 이런 시간이 정말 소중하다는 걸 느꼈다.",
    date: "2024-08-02", 
    mood: "excited",
    location: "강남",
    tags: ["친구", "삼겹살", "저녁"],
    expenses: 35000,
    images: []
  }
];

type ViewType = "dashboard" | "timeline" | "new-diary" | "analytics" | "settings";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [diaryEntries, setDiaryEntries] = useState(mockDiaryEntries);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const { toast } = useToast();

  // 통계 계산
  const stats = useMemo(() => {
    const totalEntries = diaryEntries.length;
    const totalExpenses = diaryEntries.reduce((sum, entry) => sum + (entry.expenses || 0), 0);
    const moodStats = diaryEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries,
      totalExpenses,
      moodStats,
      recentEntries: diaryEntries.slice(0, 5)
    };
  }, [diaryEntries]);

  const handleNewDiary = () => {
    setEditingEntry(null);
    setCurrentView("new-diary");
  };

  const handleEditDiary = (id: string) => {
    setEditingEntry(id);
    setCurrentView("new-diary");
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "일기가 삭제되었습니다",
      description: "선택한 일기가 성공적으로 삭제되었습니다.",
    });
  };

  const handleSaveDiary = (formData: DiaryFormData) => {
    if (editingEntry) {
      // 수정 모드
      setDiaryEntries(prev => 
        prev.map(entry => 
          entry.id === editingEntry 
            ? { ...entry, ...formData }
            : entry
        )
      );
      toast({
        title: "일기가 수정되었습니다",
        description: "변경사항이 성공적으로 저장되었습니다.",
      });
    } else {
      // 새 일기 작성
      const newEntry = {
        id: Date.now().toString(),
        ...formData,
        images: []
      };
      setDiaryEntries(prev => [newEntry, ...prev]);
      toast({
        title: "새 일기가 저장되었습니다",
        description: "오늘의 소중한 기록이 저장되었습니다.",
      });
    }
    setCurrentView("timeline");
    setEditingEntry(null);
  };

  const handleCancelDiary = () => {
    setCurrentView(editingEntry ? "timeline" : "dashboard");
    setEditingEntry(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard 
            onNewDiary={handleNewDiary}
            totalEntries={stats.totalEntries}
            totalExpenses={stats.totalExpenses}
            recentEntries={stats.recentEntries}
            moodStats={stats.moodStats}
          />
        );
      
      case "timeline":
        return (
          <Timeline
            entries={diaryEntries}
            onEdit={handleEditDiary}
            onDelete={handleDeleteDiary}
          />
        );
      
      case "new-diary":
        const editData = editingEntry 
          ? diaryEntries.find(entry => entry.id === editingEntry)
          : undefined;
        
        return (
          <DiaryForm
            onSave={handleSaveDiary}
            onCancel={handleCancelDiary}
            initialData={editData}
          />
        );
      
      case "analytics":
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-diary-ink mb-2">분석 페이지</h2>
            <p className="text-muted-foreground">곧 출시될 예정입니다!</p>
          </div>
        );
      
      case "settings":
        return <Settings />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        unreadCount={0}
      />
      
      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
