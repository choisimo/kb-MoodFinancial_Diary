import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Camera, 
  Mic, 
  Save, 
  X,
  Plus
} from "lucide-react";
import { DiaryFormData } from "@/types/diary";
import { KakaoMapPicker } from "@/components/KakaoMapPicker";
import { EmotionAnalysis } from "@/components/EmotionAnalysis";

interface DiaryFormProps {
  onSave: (entry: DiaryFormData) => void;
  onCancel: () => void;
  initialData?: Partial<DiaryFormData>;
}

const moodOptions = [
  { value: "happy", emoji: "😊", label: "행복해요" },
  { value: "sad", emoji: "😢", label: "슬퍼요" },
  { value: "neutral", emoji: "😐", label: "보통이에요" },
  { value: "excited", emoji: "🤩", label: "신나요" },
  { value: "tired", emoji: "😴", label: "피곤해요" }
] as const;

export function DiaryForm({ onSave, onCancel, initialData }: DiaryFormProps) {
  const [formData, setFormData] = useState<DiaryFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    mood: initialData?.mood || "neutral",
    location: initialData?.location || "",
    tags: initialData?.tags || [],
    expenses: initialData?.expenses || 0,
  });

  const [newTag, setNewTag] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number; address: string; placeName?: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // STT 기능 구현 예정
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-diary-paper border-diary-border shadow-diary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-diary-ink flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            오늘의 일기
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 & 날짜 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-diary-ink font-medium">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="오늘 하루를 한 줄로 표현해보세요"
                className="bg-white border-diary-border focus:ring-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-diary-ink font-medium">날짜</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-white border-diary-border focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* 기분 선택 */}
          <div>
            <Label className="text-diary-ink font-medium mb-3 block">오늘의 기분</Label>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                  className={`p-3 rounded-lg border-2 transition-smooth text-center hover:scale-105 ${
                    formData.mood === mood.value
                      ? "border-primary bg-primary/10 shadow-soft"
                      : "border-diary-border bg-white hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-diary-ink">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 내용 작성 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content" className="text-diary-ink font-medium">일기 내용</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={`${isRecording ? "bg-red-100 border-red-300" : ""}`}
              >
                <Mic className={`w-4 h-4 mr-2 ${isRecording ? "text-red-500" : ""}`} />
                {isRecording ? "녹음 중..." : "음성 입력"}
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="오늘 있었던 일, 느낀 점, 생각들을 자유롭게 적어보세요..."
              className="min-h-[150px] bg-white border-diary-border focus:ring-primary resize-none"
              required
            />
          </div>

          {/* 위치 & 지출 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-diary-ink font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                위치
              </Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="어디에서 보낸 하루인가요?"
                  className="bg-white border-diary-border focus:ring-primary flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
              {selectedLocation && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {selectedLocation.placeName || selectedLocation.address}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="expenses" className="text-diary-ink font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                오늘의 지출
              </Label>
              <Input
                id="expenses"
                type="number"
                value={formData.expenses}
                onChange={(e) => setFormData(prev => ({ ...prev, expenses: Number(e.target.value) }))}
                placeholder="0"
                className="bg-white border-diary-border focus:ring-primary"
                min="0"
              />
            </div>
          </div>

          {/* 태그 */}
          <div>
            <Label className="text-diary-ink font-medium mb-2 block">태그</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-accent text-accent-foreground px-3 py-1 cursor-pointer hover:bg-accent/80"
                  onClick={() => removeTag(tag)}
                >
                  #{tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="태그 입력"
                className="bg-white border-diary-border focus:ring-primary"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 지도 선택 */}
          {showMapPicker && (
            <KakaoMapPicker
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                setFormData(prev => ({ ...prev, location: location.placeName || location.address }));
                setShowMapPicker(false);
              }}
              initialLocation={selectedLocation}
            />
          )}

          {/* 감정 분석 */}
          {formData.content && formData.content.length > 10 && (
            <EmotionAnalysis content={formData.content} />
          )}

          {/* 이미지 업로드 */}
          <div>
            <Label className="text-diary-ink font-medium mb-2 block">사진 추가</Label>
            <Button type="button" variant="outline" className="w-full border-dashed">
              <Camera className="w-4 h-4 mr-2" />
              사진 추가하기
            </Button>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="default" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}