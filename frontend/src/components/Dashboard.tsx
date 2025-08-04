import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  Heart, 
  DollarSign,
  BarChart3,
  MapPin,
  Clock,
  Smile
} from "lucide-react";

interface DashboardProps {
  onNewDiary: () => void;
  totalEntries: number;
  totalExpenses: number;
  recentEntries?: Array<{
    id: string;
    title: string;
    date: string;
    mood: string;
    expenses?: number;
  }>;
  moodStats?: Record<string, number>;
}

const moodEmojis = {
  happy: "😊",
  sad: "😢", 
  neutral: "😐",
  excited: "🤩",
  tired: "😴"
};

export function Dashboard({ 
  onNewDiary, 
  totalEntries, 
  totalExpenses, 
  recentEntries = [],
  moodStats = {}
}: DashboardProps) {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('ko-KR', { month: 'long' });
  const today = currentDate.toLocaleDateString('ko-KR', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  const mostFrequentMood = Object.entries(moodStats).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* 환영 섹션 */}
      <Card className="bg-gradient-diary border-diary-border shadow-diary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-diary-ink mb-2">
                안녕하세요! ✨
              </h1>
              <p className="text-muted-foreground mb-4">
                {today}
              </p>
              <p className="text-diary-ink">
                오늘도 소중한 하루를 기록해보세요
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-4xl animate-float">
                📖
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onNewDiary}
            className="mt-6 w-full sm:w-auto"
            variant="default"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            새 일기 작성하기
          </Button>
        </CardContent>
      </Card>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-diary-border shadow-card hover:shadow-soft transition-smooth">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              총 일기 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthName}까지 기록
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-diary-border shadow-card hover:shadow-soft transition-smooth">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              이번 달 지출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-warning">
              {totalExpenses.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              평균 {Math.round(totalExpenses / Math.max(totalEntries, 1)).toLocaleString()}원/일
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-diary-border shadow-card hover:shadow-soft transition-smooth">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Smile className="w-4 h-4" />
              주요 기분
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {mostFrequentMood ? (
                <>
                  <span className="text-2xl">{moodEmojis[mostFrequentMood[0] as keyof typeof moodEmojis]}</span>
                  <div>
                    <div className="text-lg font-bold text-diary-ink">{mostFrequentMood[1]}회</div>
                    <p className="text-xs text-muted-foreground">가장 많은 기분</p>
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">데이터 없음</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-diary-border shadow-card hover:shadow-soft transition-smooth">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              작성 연속일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-success">3일</div>
            <p className="text-xs text-muted-foreground mt-1">
              훌륭해요! 계속 이어가세요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 일기 */}
        <Card className="bg-card border-diary-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-diary-ink">
              <Clock className="w-5 h-5" />
              최근 일기
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-diary-paper rounded-lg border border-diary-border">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {moodEmojis[entry.mood as keyof typeof moodEmojis]}
                      </div>
                      <div>
                        <div className="font-medium text-diary-ink line-clamp-1">{entry.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    {entry.expenses && (
                      <Badge variant="outline" className="text-finance-warning border-finance-warning">
                        {entry.expenses.toLocaleString()}원
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>아직 작성된 일기가 없어요</p>
                <p className="text-sm">첫 번째 일기를 작성해보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 기분 분석 */}
        <Card className="bg-card border-diary-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-diary-ink">
              <BarChart3 className="w-5 h-5" />
              이번 달 기분 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(moodStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(moodStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{moodEmojis[mood as keyof typeof moodEmojis]}</span>
                        <span className="text-diary-ink capitalize">{mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary rounded-full transition-smooth"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(moodStats))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>기분 데이터가 없어요</p>
                <p className="text-sm">일기를 작성하면 분석을 볼 수 있어요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card className="bg-card border-diary-border shadow-card">
        <CardHeader>
          <CardTitle className="text-diary-ink">빠른 시작</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="diary" onClick={onNewDiary} className="justify-start">
              <PlusCircle className="w-4 h-4 mr-2" />
              새 일기 작성
            </Button>
            <Button variant="outline" className="justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              위치별 기록 보기
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              지출 분석
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              기분 트렌드
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}