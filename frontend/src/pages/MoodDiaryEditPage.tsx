import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react';
import { MoodType, MoodDiaryRequest, MoodDiaryResponse, moodDiaryAPI } from '../services/api';

const moodOptions = [
  { value: MoodType.VERY_HAPPY, label: '매우 행복', emoji: '😄', color: '#FFD700' },
  { value: MoodType.HAPPY, label: '행복', emoji: '😊', color: '#FFA500' },
  { value: MoodType.CONTENT, label: '만족', emoji: '😌', color: '#90EE90' },
  { value: MoodType.NEUTRAL, label: '보통', emoji: '😐', color: '#D3D3D3' },
  { value: MoodType.ANXIOUS, label: '불안', emoji: '😰', color: '#87CEEB' },
  { value: MoodType.SAD, label: '슬픔', emoji: '😢', color: '#ADD8E6' },
  { value: MoodType.ANGRY, label: '화남', emoji: '😠', color: '#FF6B6B' },
  { value: MoodType.DEPRESSED, label: '우울', emoji: '😞', color: '#9370DB' },
  { value: MoodType.EXCITED, label: '신남', emoji: '🤩', color: '#FF69B4' },
  { value: MoodType.TIRED, label: '피곤', emoji: '😴', color: '#B0C4DE' },
];

const diarySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자를 초과할 수 없습니다'),
  content: z.string().max(5000, '내용은 5000자를 초과할 수 없습니다').optional(),
  mood: z.nativeEnum(MoodType, { required_error: '기분을 선택해주세요' }),
  moodIntensity: z.number().min(1).max(10),
  weather: z.string().optional(),
  location: z.string().optional(),
  isPrivate: z.boolean().default(true),
});

type DiaryFormData = z.infer<typeof diarySchema>;

const MoodDiaryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [diary, setDiary] = useState<MoodDiaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDiary, setLoadingDiary] = useState(true);
  const [error, setError] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DiaryFormData>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      moodIntensity: 5,
      isPrivate: true,
    },
  });

  const selectedMood = watch('mood');
  const moodIntensity = watch('moodIntensity');

  const loadDiary = useCallback(async (diaryId: number) => {
    try {
      setLoadingDiary(true);
      setError('');
      
      const response = await moodDiaryAPI.getDiary(diaryId);
      if (response.success) {
        const diaryData = response.data;
        setDiary(diaryData);
        
        // Form에 기존 데이터 설정
        reset({
          title: diaryData.title,
          content: diaryData.content || '',
          mood: diaryData.mood as MoodType,
          moodIntensity: diaryData.moodIntensity,
          weather: diaryData.weather || '',
          location: diaryData.location || '',
          isPrivate: diaryData.isPrivate,
        });
        
        // 태그 설정
        if (diaryData.tags) {
          setTags(diaryData.tags);
        }
      } else {
        setError(response.message || '일기를 불러오는데 실패했습니다.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '일기를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingDiary(false);
    }
  }, [reset]);

  useEffect(() => {
    if (id) {
      loadDiary(parseInt(id));
    }
  }, [id, loadDiary]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: DiaryFormData) => {
    if (!diary) return;
    
    setIsLoading(true);
    setError('');

    try {
      const diaryData: MoodDiaryRequest = {
        title: data.title,
        content: data.content,
        mood: data.mood,
        moodIntensity: data.moodIntensity,
        weather: data.weather,
        location: data.location,
        isPrivate: data.isPrivate,
        tags: tags.length > 0 ? tags : undefined,
      };

      const response = await moodDiaryAPI.updateDiary(diary.id, diaryData);
      if (response.success) {
        navigate(`/mood-diaries/${diary.id}`);
      } else {
        setError(response.message || '일기 수정에 실패했습니다.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '일기 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingDiary) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !diary) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/mood-diaries')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            일기 목록으로 돌아가기
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const selectedMoodOption = moodOptions.find(option => option.value === selectedMood);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/mood-diaries/${diary?.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            일기 상세보기로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">마음 일기 수정</h1>
          <p className="text-gray-600 mt-2">일기 내용을 수정해보세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>일기 수정</CardTitle>
            <CardDescription>
              변경하고 싶은 내용을 수정해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="일기 제목을 입력하세요"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* 기분 선택 */}
              <div className="space-y-4">
                <Label>기분 선택 *</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setValue('mood', mood.value)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedMood === mood.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{mood.emoji}</div>
                      <div className="text-sm font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
                {errors.mood && (
                  <p className="text-sm text-red-500">{errors.mood.message}</p>
                )}
              </div>

              {/* 기분 강도 */}
              {selectedMoodOption && (
                <div className="space-y-4">
                  <Label>기분 강도: {moodIntensity}/10</Label>
                  <div className="px-4">
                    <Slider
                      value={[moodIntensity]}
                      onValueChange={(value) => setValue('moodIntensity', value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>약함</span>
                    <span>강함</span>
                  </div>
                </div>
              )}

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="오늘 있었던 일이나 느낀 점을 자유롭게 작성해주세요..."
                  rows={8}
                  {...register('content')}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>

              {/* 태그 */}
              <div className="space-y-3">
                <Label>태그</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="태그 입력 후 추가 버튼을 눌러주세요"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 날씨 */}
              <div className="space-y-2">
                <Label htmlFor="weather">날씨</Label>
                <Input
                  id="weather"
                  placeholder="예: 맑음, 흐림, 비"
                  {...register('weather')}
                />
              </div>

              {/* 장소 */}
              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  placeholder="예: 집, 카페, 공원"
                  {...register('location')}
                />
              </div>

              {/* 공개 설정 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  {...register('isPrivate')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPrivate">비공개로 설정</Label>
              </div>

              {/* 제출 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/mood-diaries/${diary?.id}`)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    '일기 수정 완료'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodDiaryEditPage;
