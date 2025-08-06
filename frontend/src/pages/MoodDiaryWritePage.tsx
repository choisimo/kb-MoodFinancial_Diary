import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { MobileLayout, MobileCard, MobileBottomSheet } from '../components/ui/mobile-layout';
import { KakaoMap } from '../components/ui/kakao-map';
import { Loader2, Plus, X, MapPin, Cloud, Tag, Lock, Unlock, Save } from 'lucide-react';
import { MoodType, MoodDiaryRequest, moodDiaryAPI } from '../services/api';

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

const MoodDiaryWritePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleLocationSelect = (location: string, lat: number, lng: number) => {
    setSelectedLocation(location);
    setValue('location', location);
    setShowLocationSheet(false);
  };

  const onSubmit = async (data: DiaryFormData) => {
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

      const response = await moodDiaryAPI.createDiary(diaryData);
      if (response.success) {
        navigate('/mood-diaries');
      } else {
        setError(response.message || '일기 작성에 실패했습니다.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '일기 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMoodOption = moodOptions.find(option => option.value === selectedMood);

  return (
    <MobileLayout
      title="마음 일기 작성"
      showBackButton
      onBack={() => navigate('/mood-diaries')}
      rightAction={
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 제목 */}
          <MobileCard>
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">제목 *</Label>
              <Input
                id="title"
                placeholder="오늘의 일기 제목을 입력하세요"
                {...register('title')}
                className={`${errors.title ? 'border-red-500' : ''} text-base`}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
          </MobileCard>

          {/* 기분 선택 */}
          <MobileCard>
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">기분 선택 *</Label>
              <div className="grid grid-cols-3 gap-3">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setValue('mood', mood.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundColor: selectedMood === mood.value ? mood.color + '20' : undefined,
                    }}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">{mood.label}</div>
                  </motion.button>
                ))}
              </div>
              {errors.mood && (
                <p className="text-sm text-red-500">{errors.mood.message}</p>
              )}

              {/* 기분 강도 */}
              {selectedMood && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium text-gray-700">
                    기분 강도: {moodIntensity}
                  </Label>
                  <Slider
                    value={[moodIntensity]}
                    onValueChange={(value) => setValue('moodIntensity', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>약함</span>
                    <span>강함</span>
                  </div>
                </div>
              )}
            </div>
          </MobileCard>

          {/* 내용 */}
          <MobileCard>
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">내용</Label>
              <Textarea
                id="content"
                placeholder="오늘 있었던 일이나 느낀 점을 자유롭게 작성해주세요..."
                rows={6}
                {...register('content')}
                className={`${errors.content ? 'border-red-500' : ''} text-base resize-none`}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
          </MobileCard>

          {/* 태그 */}
          <MobileCard>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                태그
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="태그 입력"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 text-base"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
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
          </MobileCard>

          {/* 날씨 */}
          <MobileCard>
            <div className="space-y-3">
              <Label htmlFor="weather" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                날씨
              </Label>
              <Input
                id="weather"
                placeholder="예: 맑음, 흐림, 비"
                {...register('weather')}
                className="text-base"
              />
            </div>
          </MobileCard>

          {/* 장소 */}
          <MobileCard>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                장소
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="장소를 입력하거나 지도에서 선택하세요"
                  value={selectedLocation || watch('location') || ''}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setValue('location', e.target.value);
                  }}
                  className="flex-1 text-base"
                />
                <Button
                  type="button"
                  onClick={() => setShowLocationSheet(true)}
                  variant="outline"
                  size="sm"
                >
                  지도
                </Button>
              </div>
            </div>
          </MobileCard>

          {/* 공개 설정 */}
          <MobileCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {watch('isPrivate') ? (
                  <Lock className="h-4 w-4 text-gray-600" />
                ) : (
                  <Unlock className="h-4 w-4 text-gray-600" />
                )}
                <Label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                  비공개로 설정
                </Label>
              </div>
              <input
                type="checkbox"
                id="isPrivate"
                {...register('isPrivate')}
                className="rounded border-gray-300 w-5 h-5"
              />
            </div>
          </MobileCard>
        </form>

        {/* 위치 선택 바텀 시트 */}
        <MobileBottomSheet
          isOpen={showLocationSheet}
          onClose={() => setShowLocationSheet(false)}
          title="위치 선택"
        >
          <div className="p-4">
            <KakaoMap
              location={selectedLocation}
              onLocationSelect={handleLocationSelect}
              height="400px"
            />
          </div>
        </MobileBottomSheet>
      </div>
    </MobileLayout>
  );
};

export default MoodDiaryWritePage;
