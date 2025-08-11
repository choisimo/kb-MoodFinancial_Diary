import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  mood: string;
  moodEmoji: string;
  moodColor: string;
  moodIntensity: number;
  tags: string[];
  weather: string;
  isPrivate: boolean;
  createdAt: string;
  wordCount: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  diaries: DiaryEntry[];
}

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    loadDiariesForMonth();
  }, [currentDate]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      generateCalendarDays();
    }
  }, [diaries, currentDate, viewMode]);

  const loadDiariesForMonth = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-diaries?page=0&size=100&sortBy=createdAt&sortDir=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const monthlyDiaries = data.data.diaries.filter((diary: any) => {
          const diaryDate = new Date(diary.createdAt);
          return diaryDate >= startDate && diaryDate <= endDate;
        });
        setDiaries(monthlyDiaries);
      } else {
        toast({
          title: '일기 로딩 실패',
          description: '일기를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Load diaries error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayDiaries = diaries.filter(diary => {
        const diaryDate = new Date(diary.createdAt);
        return (
          diaryDate.getDate() === date.getDate() &&
          diaryDate.getMonth() === date.getMonth() &&
          diaryDate.getFullYear() === date.getFullYear()
        );
      });
      
      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        diaries: dayDiaries,
      });
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">타임라인</h1>
            <p className="text-gray-600 mt-2">시간 순으로 일기를 살펴보세요</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 뷰 모드 전환 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                캘린더
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                리스트
              </Button>
            </div>
            
            <Button onClick={() => navigate('/mood-diaries/write')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              일기 쓰기
            </Button>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">{formatMonthYear(currentDate)}</h2>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  오늘
                </Button>
              </div>
              
              <Button variant="outline" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 캘린더 뷰 */}
        {viewMode === 'calendar' && (
          <Card>
            <CardContent className="p-6">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      !day.isCurrentMonth ? 'text-gray-400' : 
                      isToday(day.date) ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* 일기들 */}
                    <div className="space-y-1">
                      {day.diaries.slice(0, 3).map((diary) => (
                        <div
                          key={diary.id}
                          onClick={() => navigate(`/mood-diaries/${diary.id}`)}
                          className="cursor-pointer p-1 rounded text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
                          style={{ backgroundColor: diary.moodColor + '20' }}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span>{diary.moodEmoji}</span>
                            <span className="truncate">{diary.title}</span>
                          </div>
                        </div>
                      ))}
                      
                      {day.diaries.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.diaries.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 리스트 뷰 */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {diaries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    이번 달에 작성한 일기가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6">첫 번째 일기를 작성해보세요!</p>
                  <Button onClick={() => navigate('/mood-diaries/write')}>
                    <Plus className="w-4 h-4 mr-2" />
                    일기 쓰기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // 날짜별로 그룹화
              Object.entries(
                diaries.reduce((groups, diary) => {
                  const date = new Date(diary.createdAt).toDateString();
                  if (!groups[date]) {
                    groups[date] = [];
                  }
                  groups[date].push(diary);
                  return groups;
                }, {} as Record<string, DiaryEntry[]>)
              ).map(([dateString, dayDiaries]) => (
                <div key={dateString}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(new Date(dateString))}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500">{dayDiaries.length}개</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {dayDiaries.map((diary) => (
                      <Card
                        key={diary.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/mood-diaries/${diary.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="text-2xl w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: diary.moodColor + '20' }}
                            >
                              {diary.moodEmoji}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate mb-1">
                                {diary.title}
                              </h4>
                              
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {diary.content}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Badge variant="secondary" className="text-xs">
                                  {diary.mood}
                                </Badge>
                                <span>강도 {diary.moodIntensity}/10</span>
                                {diary.weather && (
                                  <>
                                    <span>•</span>
                                    <span>{diary.weather}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{diary.wordCount}자</span>
                                {diary.isPrivate && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-600">비공개</span>
                                  </>
                                )}
                              </div>
                              
                              {diary.tags && diary.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {diary.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {diary.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{diary.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              {new Date(diary.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};