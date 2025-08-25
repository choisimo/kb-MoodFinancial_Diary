import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Heart, Cloud, MapPin, Tag, X, Plus, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { EmotionAnalysis } from '@/components/EmotionAnalysis';
import { AIRecommendations } from '@/components/AIRecommendations';
import { moodDiaryAPI, aiAPI, EmotionAnalysisResult, MoodType } from '@/services/api';

interface DiaryData {
  title: string;
  content: string;
  mood: MoodType | '';
  moodIntensity: number;
  tags: string[];
  weather: string;
  location: string;
  isPrivate: boolean;
}

const MOOD_TYPES = [
  { name: MoodType.VERY_HAPPY, koreanName: '매우 행복', emoji: '😄', color: '#FFD700' },
  { name: MoodType.HAPPY, koreanName: '행복', emoji: '😊', color: '#FFA500' },
  { name: MoodType.CONTENT, koreanName: '만족', emoji: '😌', color: '#90EE90' },
  { name: MoodType.NEUTRAL, koreanName: '보통', emoji: '😐', color: '#D3D3D3' },
  { name: MoodType.ANXIOUS, koreanName: '불안', emoji: '😰', color: '#87CEEB' },
  { name: MoodType.SAD, koreanName: '슬픔', emoji: '😢', color: '#ADD8E6' },
  { name: MoodType.ANGRY, koreanName: '화남', emoji: '😠', color: '#FF6B6B' },
  { name: MoodType.DEPRESSED, koreanName: '우울', emoji: '😞', color: '#9370DB' },
  { name: MoodType.EXCITED, koreanName: '신남', emoji: '🤩', color: '#FF69B4' },
  { name: MoodType.TIRED, koreanName: '피곤', emoji: '😴', color: '#B0C4DE' },
];

export const DiaryWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [emotionAnalysisResult, setEmotionAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [savedDiaryId, setSavedDiaryId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DiaryData>({
    title: '',
    content: '',
    mood: '',
    moodIntensity: 5,
    tags: [],
    weather: '',
    location: '',
    isPrivate: true,
  });

  // 임시저장된 데이터 로드
  useEffect(() => {
    const savedDraft = localStorage.getItem('diary-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        toast({
          title: '임시저장된 일기를 불러왔습니다',
          description: '작성을 계속하세요.',
        });
      } catch (error) {
        console.error('Draft loading error:', error);
      }
    }
  }, []);

  // 자동 임시저장 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.content) {
        localStorage.setItem('diary-draft', JSON.stringify(formData));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleInputChange = (field: keyof DiaryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoodSelect = (moodName: MoodType) => {
    handleInputChange('mood', moodName);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleEmotionAnalysisComplete = (result: EmotionAnalysisResult) => {
    setEmotionAnalysisResult(result);
  };

  const saveDiary = async (isDraft = false) => {
    if (!formData.title.trim()) {
      toast({
        title: '제목을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.mood) {
      toast({
        title: '감정을 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const requestData = {
        title: formData.title,
        content: formData.content,
        mood: formData.mood,
        moodIntensity: formData.moodIntensity,
        tags: formData.tags,
        weather: formData.weather,
        location: formData.location,
        isPrivate: formData.isPrivate,
      };

      const response = await moodDiaryAPI.createDiary(requestData);
      
      if (response.success) {
        const diaryId = response.data.id;
        setSavedDiaryId(diaryId);
        
        // 임시저장 데이터 삭제
        localStorage.removeItem('diary-draft');
        
        toast({
          title: isDraft ? '임시저장 완료' : '일기 저장 완료',
          description: isDraft ? '일기가 임시저장되었습니다.' : '일기가 성공적으로 저장되었습니다.',
        });

        // AI 종합 분석 시작
        if (!isDraft && diaryId) {
          try {
            await aiAPI.processComprehensiveAnalysis(diaryId);
            toast({
              title: 'AI 분석 완료',
              description: 'AI 기반 감정 분석이 완료되었습니다.',
            });
          } catch (error) {
            console.error('AI analysis error:', error);
          }
        }

        if (!isDraft) {
          navigate('/mood-diaries');
        }
      } else {
        toast({
          title: '저장 실패',
          description: response.message || '일기 저장에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedMood = MOOD_TYPES.find(mood => mood.name === formData.mood);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">일기 작성</h1>
          <p className="text-gray-600 mt-2">오늘의 감정과 경험을 기록해보세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 작성 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제목 */}
            <Card>
              <CardHeader>
                <CardTitle>제목</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="일기 제목을 입력하세요"
                  maxLength={255}
                />
              </CardContent>
            </Card>

            {/* 내용 */}
            <Card>
              <CardHeader>
                <CardTitle>내용</CardTitle>
                <CardDescription>
                  오늘 있었던 일, 느낀 점 등을 자유롭게 작성해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="오늘은 어떤 하루였나요?"
                  className="min-h-[300px] resize-none"
                  maxLength={10000}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {formData.content.length} / 10,000자
                </div>
              </CardContent>
            </Card>

            {/* 감정 선택 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  감정 선택
                </CardTitle>
                <CardDescription>
                  현재 기분을 가장 잘 표현하는 감정을 선택해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  {MOOD_TYPES.map((mood) => (
                    <button
                      key={mood.name}
                      onClick={() => handleMoodSelect(mood.name)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.mood === mood.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: formData.mood === mood.name ? mood.color + '20' : undefined,
                      }}
                    >
                      <div className="text-2xl mb-2">{mood.emoji}</div>
                      <div className="text-sm font-medium">{mood.koreanName}</div>
                    </button>
                  ))}
                </div>

                {selectedMood && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        감정 강도: {formData.moodIntensity}/10
                      </Label>
                      <Slider
                        value={[formData.moodIntensity]}
                        onValueChange={(value) => handleInputChange('moodIntensity', value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>약함</span>
                        <span>강함</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI 실시간 감정 분석 */}
            {formData.content.length > 10 && (
              <EmotionAnalysis 
                content={formData.content}
                diaryId={savedDiaryId || undefined}
                onAnalysisComplete={handleEmotionAnalysisComplete}
              />
            )}
          </div>

          {/* 사이드 영역 */}
          <div className="space-y-6">
            {/* 태그 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-500" />
                  태그
                </CardTitle>
                <CardDescription>
                  일기를 분류할 태그를 추가해보세요. (최대 10개)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="태그 입력"
                    maxLength={20}
                    disabled={formData.tags.length >= 10}
                  />
                  <Button
                    onClick={handleAddTag}
                    size="sm"
                    disabled={!newTag.trim() || formData.tags.length >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 날씨 & 위치 */}
            <Card>
              <CardHeader>
                <CardTitle>추가 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-gray-500" />
                    날씨
                  </Label>
                  <Input
                    value={formData.weather}
                    onChange={(e) => handleInputChange('weather', e.target.value)}
                    placeholder="예: 맑음, 비, 흐림"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    위치
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="예: 집, 카페, 공원"
                    maxLength={255}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 공개 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>공개 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private-mode"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                  />
                  <Label htmlFor="private-mode" className="text-sm">
                    비공개로 설정
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  비공개 일기는 나만 볼 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* 저장 버튼 */}
            <div className="space-y-3">
              <Button
                onClick={() => saveDiary(false)}
                disabled={loading || !formData.title.trim() || !formData.mood}
                className="w-full"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? '저장 중...' : '일기 저장'}
              </Button>
              
              <Button
                onClick={() => saveDiary(true)}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                임시저장
              </Button>
            </div>

            {/* AI 추천 시스템 */}
            {(emotionAnalysisResult || savedDiaryId) && (
              <AIRecommendations diaryId={savedDiaryId || undefined} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};