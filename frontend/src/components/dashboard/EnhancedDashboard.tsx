import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Heart,
  BarChart3,
  Settings,
  User,
  List,
  Grid,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalDiaries: number;
  weeklyDiaries: number;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  recentMood: string;
}

interface RecentDiary {
  id: number;
  title: string;
  mood: string;
  moodEmoji: string;
  moodColor: string;
  createdAt: string;
}

export const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDiaries, setRecentDiaries] = useState<RecentDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 통계 데이터 로드 (모의 데이터)
      setStats({
        totalDiaries: 42,
        weeklyDiaries: 5,
        totalBalance: 2500000,
        monthlyExpenses: 850000,
        monthlyIncome: 3200000,
        recentMood: '😊',
      });

      // 최근 일기 로드
      const diariesResponse = await fetch('/api/mood-diaries?page=0&size=5', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (diariesResponse.ok) {
        const data = await diariesResponse.json();
        setRecentDiaries(data.data?.diaries || []);
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">무드다이어리</h1>
              <p className="text-gray-600">오늘도 좋은 하루 보내세요!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 빠른 액션 */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/mood-diaries/write')}
              className="h-16 flex flex-col items-center justify-center gap-2"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-sm">일기 쓰기</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/mood-diaries')}
              className="h-16 flex flex-col items-center justify-center gap-2"
            >
              <List className="w-6 h-6" />
              <span className="text-sm">일기 목록</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/timeline')}
              className="h-16 flex flex-col items-center justify-center gap-2"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">타임라인</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">분석</span>
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 일기 수</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDiaries}</div>
              <p className="text-xs text-muted-foreground">
                이번 주 +{stats?.weeklyDiaries}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 잔액</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalBalance || 0)}</div>
              <p className="text-xs text-muted-foreground">
                모든 계좌 기준
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 지출</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats?.monthlyExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                지난 달 대비 -5%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 수입</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.monthlyIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                지난 달과 동일
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최근 일기 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>최근 일기</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/mood-diaries')}
                >
                  전체 보기
                </Button>
              </div>
              <CardDescription>최근에 작성한 일기들을 확인해보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDiaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>아직 작성한 일기가 없습니다</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/mood-diaries/write')}
                    >
                      첫 번째 일기 작성하기
                    </Button>
                  </div>
                ) : (
                  recentDiaries.map((diary) => (
                    <div
                      key={diary.id}
                      onClick={() => navigate(`/mood-diaries/${diary.id}`)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div
                        className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: diary.moodColor + '20' }}
                      >
                        {diary.moodEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{diary.title}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(diary.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 감정 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 주 감정</CardTitle>
              <CardDescription>주간 감정 패턴을 확인해보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">{stats?.recentMood}</div>
                <p className="text-lg font-medium mb-2">전반적으로 좋은 기분이에요!</p>
                <p className="text-sm text-gray-500 mb-4">
                  이번 주는 긍정적인 감정이 70% 이상이었어요
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>😄 매우 기쁨</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>😊 기쁨</span>
                    <span>40%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>😐 보통</span>
                    <span>20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>😢 슬픔</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* 지출 카테고리 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 달 지출 카테고리</CardTitle>
              <CardDescription>어디에 돈을 가장 많이 쓰셨나요?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>식비</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>교통비</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-green-500"></div>
                    </div>
                    <span className="text-sm font-medium">50%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>쇼핑</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-purple-500"></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 감정-지출 연관성 */}
          <Card>
            <CardHeader>
              <CardTitle>감정과 지출 패턴</CardTitle>
              <CardDescription>기분에 따른 소비 패턴을 분석해보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg font-medium mb-2">흥미로운 패턴을 발견했어요!</p>
                <p className="text-sm text-gray-500 mb-4">
                  기쁜 날에는 평소보다 20% 더 많이 지출하는 경향이 있어요
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span>😊</span>
                      <span>기쁜 날</span>
                    </span>
                    <span className="font-medium">+20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span>😐</span>
                      <span>보통 날</span>
                    </span>
                    <span className="font-medium">평균</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span>😢</span>
                      <span>슬픈 날</span>
                    </span>
                    <span className="font-medium">-10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};