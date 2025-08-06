import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MobileLayout, MobileCard, MobileFab } from '../components/ui/mobile-layout';
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Cloud, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { MoodDiaryResponse, PageResponse, moodDiaryAPI } from '../services/api';

const MoodDiaryListPage: React.FC = () => {
  const [diaries, setDiaries] = useState<PageResponse<MoodDiaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

  const loadDiaries = async (page = 0, keyword = '') => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (keyword.trim()) {
        response = await moodDiaryAPI.searchDiaries(keyword, page, pageSize);
      } else {
        response = await moodDiaryAPI.getDiaries(page, pageSize);
      }
      
      if (response.success) {
        setDiaries(response.data);
      } else {
        setError(response.message || '일기 목록을 불러오는데 실패했습니다.');
      }
    } catch (err: unknown) {
      console.error('일기 목록 로드 오류:', err);
      setError('일기 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiaries(currentPage, searchKeyword);
  }, [currentPage, loadDiaries, searchKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadDiaries(0, searchKeyword);
  };

  const handleDelete = async (diaryId: number) => {
    if (!window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await moodDiaryAPI.deleteDiary(diaryId);
      if (response.success) {
        loadDiaries(currentPage, searchKeyword);
      } else {
        setError(response.message || '일기 삭제에 실패했습니다.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '일기 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <MobileLayout title="마음 일기">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="마음 일기"
      rightAction={
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          size="sm"
        >
          대시보드
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mx-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 검색 */}
        <div className="px-4">
          <MobileCard>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="일기 제목이나 내용으로 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button type="submit" size="sm">
                검색
              </Button>
            </form>
          </MobileCard>
        </div>

        {/* 일기 목록 */}
        {diaries && diaries.content.length > 0 ? (
          <div className="space-y-3">
            {diaries.content.map((diary, index) => (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-4"
              >
                <MobileCard 
                  onClick={() => navigate(`/mood-diaries/${diary.id}`)}
                  className="cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-3xl">{diary.moodEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {diary.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(diary.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/mood-diaries/${diary.id}/edit`);
                          }}
                          className="p-2 h-auto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(diary.id);
                          }}
                          className="p-2 h-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 기분 및 메타 정보 */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        style={{ backgroundColor: diary.moodColor, color: '#000' }}
                        className="text-xs px-2 py-1"
                      >
                        {diary.moodKoreanName}
                      </Badge>
                      
                      {diary.weather && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Cloud className="h-3 w-3" />
                          {diary.weather}
                        </div>
                      )}

                      {diary.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {diary.location}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {diary.isPrivate ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            비공개
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            공개
                          </>
                        )}
                      </div>
                    </div>

                    {/* 내용 미리보기 */}
                    {diary.content && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {diary.content.length > 100 
                          ? `${diary.content.substring(0, 100)}...` 
                          : diary.content
                        }
                      </p>
                    )}

                    {/* 태그 */}
                    {diary.tags && diary.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {diary.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
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
                </MobileCard>
              </motion.div>
            ))}

            {/* 페이지네이션 */}
            {diaries.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={diaries.first}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentPage + 1} / {diaries.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={diaries.last}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4">
            <MobileCard className="text-center py-12">
              <div className="space-y-4">
                <div className="text-6xl">📝</div>
                <div>
                  <p className="text-gray-500 mb-4">아직 작성한 일기가 없습니다.</p>
                  <Button onClick={() => navigate('/mood-diaries/write')}>
                    <Plus className="mr-2 h-4 w-4" />
                    첫 번째 일기 작성하기
                  </Button>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* 플로팅 액션 버튼 */}
        <MobileFab
          onClick={() => navigate('/mood-diaries/write')}
          icon={<Plus className="h-6 w-6" />}
        />
      </div>
    </MobileLayout>
  );
};

export default MoodDiaryListPage;
