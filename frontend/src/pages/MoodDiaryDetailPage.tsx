import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MobileLayout, MobileCard, MobileBottomSheet } from '../components/ui/mobile-layout';
import { KakaoMap } from '../components/ui/kakao-map';
import { 
  Calendar, 
  MapPin, 
  Cloud, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  Heart,
  MoreVertical,
  Share
} from 'lucide-react';
import { MoodDiaryResponse, moodDiaryAPI } from '../services/api';

const MoodDiaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [diary, setDiary] = useState<MoodDiaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadDiary(parseInt(id));
    }
  }, [id]);

  const loadDiary = async (diaryId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await moodDiaryAPI.getDiary(diaryId);
      if (response.success) {
        setDiary(response.data);
      } else {
        setError(response.message || '일기를 불러오는데 실패했습니다.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '일기를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!diary || !window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await moodDiaryAPI.deleteDiary(diary.id);
      if (response.success) {
        navigate('/mood-diaries');
      } else {
        setError(response.message || '일기 삭제에 실패했습니다.');
      }
    } catch (err: unknown) {
      console.error('삭제 오류:', err);
      alert('일기 삭제 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <MobileLayout title="일기 보기" showBackButton>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !diary) {
    return (
      <MobileLayout title="일기 보기" showBackButton>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription>
              {error || '일기를 찾을 수 없습니다.'}
            </AlertDescription>
          </Alert>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title={diary.title}
      showBackButton
      onBack={() => navigate('/mood-diaries')}
      rightAction={
        <Button
          onClick={() => setShowActionSheet(true)}
          variant="ghost"
          size="sm"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mx-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 기분 및 기본 정보 */}
        <div className="px-4">
          <MobileCard>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl"
                >
                  {diary.moodEmoji}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(diary.createdAt)}
                  </div>
                  {diary.updatedAt !== diary.createdAt && (
                    <div className="text-xs text-gray-400">
                      수정됨: {formatDate(diary.updatedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* 기분 및 메타 정보 */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  style={{ backgroundColor: diary.moodColor, color: '#000' }}
                  className="text-sm px-3 py-1"
                >
                  {diary.moodKoreanName}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">강도: {diary.moodIntensity}/10</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {diary.isPrivate ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      비공개
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      공개
                    </>
                  )}
                </div>
              </div>

              {/* 태그 */}
              {diary.tags && diary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {diary.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </MobileCard>
        </div>

        {/* 날씨 정보 */}
        {diary.weather && (
          <div className="px-4">
            <MobileCard>
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">날씨</div>
                  <div className="text-base">{diary.weather}</div>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* 위치 정보 */}
        {diary.location && (
          <div className="px-4">
            <MobileCard 
              onClick={() => setShowLocationMap(true)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">위치</div>
                  <div className="text-base">{diary.location}</div>
                </div>
                <div className="text-sm text-blue-600">지도 보기</div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* 일기 내용 */}
        {diary.content && (
          <div className="px-4">
            <MobileCard>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">내용</div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {diary.content}
                  </div>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* 액션 시트 */}
        <MobileBottomSheet
          isOpen={showActionSheet}
          onClose={() => setShowActionSheet(false)}
          title="일기 관리"
        >
          <div className="p-4 space-y-3">
            <Button
              onClick={() => {
                setShowActionSheet(false);
                navigate(`/mood-diaries/${diary.id}/edit`);
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <Edit className="mr-3 h-4 w-4" />
              일기 수정
            </Button>
            
            <Button
              onClick={() => {
                setShowActionSheet(false);
                // 공유 기능 구현
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <Share className="mr-3 h-4 w-4" />
              공유하기
            </Button>
            
            <Button
              onClick={() => {
                setShowActionSheet(false);
                handleDelete();
              }}
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-3 h-4 w-4" />
              일기 삭제
            </Button>
          </div>
        </MobileBottomSheet>

        {/* 위치 지도 시트 */}
        <MobileBottomSheet
          isOpen={showLocationMap}
          onClose={() => setShowLocationMap(false)}
          title="위치"
        >
          <div className="p-4">
            <KakaoMap
              location={diary.location}
              readonly={true}
              height="400px"
            />
          </div>
        </MobileBottomSheet>
      </div>
    </MobileLayout>
  );
};

export default MoodDiaryDetailPage;
