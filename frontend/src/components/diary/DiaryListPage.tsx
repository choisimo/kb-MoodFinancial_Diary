import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Eye, Edit, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface MoodDiarySummary {
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
  updatedAt: string;
  wordCount: number;
  hasImages: boolean;
}

interface DiaryListResponse {
  diaries: MoodDiarySummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const DiaryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState<MoodDiarySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadDiaries();
  }, [currentPage, sortBy, sortDir]);

  const loadDiaries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = searchKeyword
        ? `/api/mood-diaries/search?keyword=${encodeURIComponent(searchKeyword)}&page=${currentPage}&size=${pageSize}`
        : `/api/mood-diaries?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const diaryData: DiaryListResponse = data.data;
        setDiaries(diaryData.diaries);
        setTotalPages(diaryData.totalPages);
        setTotalElements(diaryData.totalElements);
      } else {
        toast({
          title: '일기 목록 로딩 실패',
          description: '일기 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Diary list loading error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadDiaries();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (diaryId: number) => {
    if (!window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mood-diaries/${diaryId}`, {
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
        loadDiaries();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">감정 일기</h1>
            <p className="text-gray-600 mt-2">총 {totalElements}개의 일기</p>
          </div>
          <Button onClick={() => navigate('/mood-diaries/write')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            일기 쓰기
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="일기 제목이나 내용을 검색하세요..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">작성일</SelectItem>
                    <SelectItem value="title">제목</SelectItem>
                    <SelectItem value="mood">감정</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortDir} onValueChange={setSortDir}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">내림차순</SelectItem>
                    <SelectItem value="asc">오름차순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 일기 목록 */}
        <div className="space-y-4">
          {diaries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchKeyword ? '검색 결과가 없습니다' : '작성된 일기가 없습니다'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchKeyword ? '다른 키워드로 검색해보세요' : '첫 번째 일기를 작성해보세요'}
                </p>
                {!searchKeyword && (
                  <Button onClick={() => navigate('/mood-diaries/write')}>
                    <Plus className="w-4 h-4 mr-2" />
                    일기 쓰기
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            diaries.map((diary) => (
              <Card key={diary.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 제목과 감정 */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="text-2xl flex items-center justify-center w-10 h-10 rounded-full"
                          style={{ backgroundColor: diary.moodColor + '20' }}
                        >
                          {diary.moodEmoji}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {diary.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{diary.mood}</span>
                            <span>•</span>
                            <span>강도 {diary.moodIntensity}/10</span>
                            {diary.isPrivate && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">비공개</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 내용 미리보기 */}
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {diary.content}
                      </p>

                      {/* 태그 */}
                      {diary.tags && diary.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {diary.tags.slice(0, 5).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {diary.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{diary.tags.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(diary.createdAt)}</span>
                          <span>{formatTime(diary.createdAt)}</span>
                        </div>
                        {diary.weather && (
                          <div className="flex items-center gap-1">
                            <span>🌤️</span>
                            <span>{diary.weather}</span>
                          </div>
                        )}
                        <span>{diary.wordCount}자</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/mood-diaries/${diary.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/mood-diaries/${diary.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(diary.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              이전
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};