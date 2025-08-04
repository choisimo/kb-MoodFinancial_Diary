import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Zap, Cloud, Sun } from "lucide-react";

interface EmotionScore {
  emotion: string;
  score: number;
  color: string;
  icon: React.ReactNode;
}

interface EmotionAnalysisProps {
  content: string;
  className?: string;
}

// 감정 키워드 매핑
const emotionKeywords = {
  happy: ["행복", "기쁘", "즐거", "웃음", "신나", "좋아", "만족", "축하", "사랑", "감사"],
  sad: ["슬프", "우울", "힘들", "아프", "눈물", "걱정", "불안", "외로", "그리워", "아쉬"],
  angry: ["화나", "짜증", "분노", "열받", "빡쳐", "스트레스", "답답", "억울", "밉", "싫어"],
  anxious: ["불안", "걱정", "긴장", "두려", "무서", "떨려", "초조", "조바심", "염려", "겁나"],
  excited: ["신나", "들뜨", "흥미", "기대", "설렘", "환상", "놀라", "재미", "활기", "열정"],
  peaceful: ["평온", "차분", "고요", "안정", "편안", "여유", "릴렉스", "힐링", "평화", "조용"],
  grateful: ["감사", "고마", "축복", "다행", "소중", "귀한", "값진", "복받", "은혜", "선물"]
};

const emotionConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  happy: { color: "text-yellow-500", icon: <Sun className="w-4 h-4" />, label: "행복함" },
  sad: { color: "text-blue-500", icon: <Cloud className="w-4 h-4" />, label: "슬픔" },
  angry: { color: "text-red-500", icon: <Zap className="w-4 h-4" />, label: "분노" },
  anxious: { color: "text-purple-500", icon: <Brain className="w-4 h-4" />, label: "불안" },
  excited: { color: "text-orange-500", icon: <Heart className="w-4 h-4" />, label: "흥분" },
  peaceful: { color: "text-green-500", icon: <Cloud className="w-4 h-4" />, label: "평온" },
  grateful: { color: "text-pink-500", icon: <Heart className="w-4 h-4" />, label: "감사" }
};

export function EmotionAnalysis({ content, className }: EmotionAnalysisProps) {
  const [emotions, setEmotions] = useState<EmotionScore[]>([]);
  const [dominantEmotion, setDominantEmotion] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (content && content.length > 10) {
      analyzeEmotion(content);
    }
  }, [content]);

  const analyzeEmotion = async (text: string) => {
    setIsAnalyzing(true);
    
    // 키워드 기반 감정 분석
    const emotionScores: Record<string, number> = {};
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      emotionScores[emotion] = score;
    });

    // 점수 정규화 (0-100)
    const maxScore = Math.max(...Object.values(emotionScores));
    const normalizedEmotions: EmotionScore[] = Object.entries(emotionScores)
      .map(([emotion, score]) => ({
        emotion,
        score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        color: emotionConfig[emotion]?.color || "text-gray-500",
        icon: emotionConfig[emotion]?.icon || <Brain className="w-4 h-4" />
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    setEmotions(normalizedEmotions);
    setDominantEmotion(normalizedEmotions[0]?.emotion || "");
    
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  if (!content || content.length < 10) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            감정 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            일기 내용을 10자 이상 작성하면 감정 분석이 시작됩니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          감정 분석
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {emotions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            감정을 분석할 수 없습니다
          </p>
        ) : (
          <>
            {/* 주요 감정 */}
            {dominantEmotion && (
              <div className="text-center p-4 bg-accent/20 rounded-lg border border-accent/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className={emotionConfig[dominantEmotion]?.color}>
                    {emotionConfig[dominantEmotion]?.icon}
                  </span>
                  <span className="font-medium">
                    {emotionConfig[dominantEmotion]?.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  오늘의 주요 감정이에요
                </p>
              </div>
            )}

            {/* 감정 점수 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">감정 분포</h4>
              {emotions.slice(0, 5).map((emotion) => (
                <div key={emotion.emotion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={emotion.color}>
                        {emotion.icon}
                      </span>
                      <span className="text-sm font-medium">
                        {emotionConfig[emotion.emotion]?.label}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {emotion.score}%
                    </Badge>
                  </div>
                  <Progress 
                    value={emotion.score} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>

            {/* 감정 팁 */}
            {dominantEmotion && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 {getEmotionTip(dominantEmotion)}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getEmotionTip(emotion: string): string {
  const tips: Record<string, string> = {
    happy: "긍정적인 에너지를 느끼고 계시네요! 이 기분을 오래 간직하세요.",
    sad: "힘든 시간을 보내고 계시는군요. 충분히 쉬시고 자신을 돌봐주세요.",
    angry: "화가 나는 하루였나봐요. 깊게 숨을 쉬고 진정해보세요.",
    anxious: "불안한 마음이 느껴져요. 명상이나 산책이 도움이 될 수 있어요.",
    excited: "설레는 마음이 전해져요! 이 에너지를 좋은 곳에 활용해보세요.",
    peaceful: "평온한 하루를 보내셨네요. 이런 여유로운 시간을 자주 가져보세요.",
    grateful: "감사하는 마음이 느껴져요. 감사함은 더 많은 행복을 가져다줍니다."
  };
  
  return tips[emotion] || "오늘 하루도 수고하셨어요!";
}