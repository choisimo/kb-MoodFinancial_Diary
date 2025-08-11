import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Cloud, Tag, Eye, EyeOff, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface DiaryDetail {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood: string;
  moodIntensity: number;
  tags: string[];
  weather: string;
  location: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userNickname: string;
  moodDisplay: string;
  moodEmoji: string;
  moodColor: string;
  wordCount: number;
  hasImages: boolean;
  commentCount: number;
}

export const DiaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDiary();
    }
  }, [id]);

  const loadDiary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-diaries/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDiary(data.data);
      } else {
        toast({
          title: '일기 로딩 실패',
          description: '일기를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        navigate('/mood-diaries');
      }
    } catch (error) {
      console.error('Diary loading error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-diaries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: '일기 삭제 완료',
          description: '일기가 성공적으로 삭제되었습니다.',
        });
        navigate('/mood-diaries');
      } else {
        toast({
          title: '삭제 실패',
          description: '일기 삭제에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      time: date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">일기를 찾을 수 없습니다</h2>
          <Button onClick={() => navigate('/mood-diaries')}>일기 목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(diary.createdAt);
  const isEdited = diary.createdAt !== diary.updatedAt;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/mood-diaries')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            일기 목록
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/mood-diaries/${diary.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              수정
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 일기 내용 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제목과 감정 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="text-4xl w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: diary.moodColor + '20' }}
                  >
                    {diary.moodEmoji}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{diary.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Badge
                        style={{ backgroundColor: diary.moodColor, color: '#000' }}
                        className="px-3 py-1"
                      >
                        {diary.moodDisplay}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>강도 {diary.moodIntensity}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 내용 */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                    {diary.content || '내용이 없습니다.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 태그 */}
            {diary.tags && diary.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-500" />
                    태그
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {diary.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 정보 */}
          <div className="space-y-6">
            {/* 일기 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>일기 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{date}</div>
                    <div className="text-sm text-gray-500">{time}</div>
                  </div>
                </div>

                {isEdited && (
                  <div className="text-sm text-gray-500">
                    <span>마지막 수정: </span>
                    <span>{formatDateTime(diary.updatedAt).date}</span>
                    <span> {formatDateTime(diary.updatedAt).time}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {diary.isPrivate ? (
                    <>
                      <EyeOff className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">비공개 일기</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">공개 일기</span>
                    </>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  총 {diary.wordCount}자
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 */}
            {(diary.weather || diary.location) && (
              <Card>
                <CardHeader>
                  <CardTitle>추가 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diary.weather && (
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">날씨</div>
                        <div className="text-sm text-gray-500">{diary.weather}</div>
                      </div>
                    </div>
                  )}

                  {diary.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">위치</div>
                        <div className="text-sm text-gray-500">{diary.location}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 추천 기능 (추후 구현) */}
            <Card>
              <CardHeader>
                <CardTitle>관련 일기</CardTitle>
                <CardDescription>
                  비슷한 감정이나 태그의 일기들
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  곧 추가될 기능입니다
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};