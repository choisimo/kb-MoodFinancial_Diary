import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Zap, Cloud, Sun, AlertCircle, TrendingUp } from "lucide-react";
import { aiAPI, EmotionAnalysisResult } from "@/services/api";

interface EmotionScore {
  emotion: string;
  score: number;
  color: string;
  icon: React.ReactNode;
}

interface EmotionAnalysisProps {
  content: string;
  className?: string;
  diaryId?: number;
  onAnalysisComplete?: (result: EmotionAnalysisResult) => void;
}

const emotionConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  joy: { color: "text-yellow-500", icon: <Sun className="w-4 h-4" />, label: "기쁨" },
  sadness: { color: "text-blue-500", icon: <Cloud className="w-4 h-4" />, label: "슬픔" },
  anger: { color: "text-red-500", icon: <Zap className="w-4 h-4" />, label: "분노" },
  anxiety: { color: "text-purple-500", icon: <Brain className="w-4 h-4" />, label: "불안" },
  satisfaction: { color: "text-green-500", icon: <Heart className="w-4 h-4" />, label: "만족" },
  VERY_POSITIVE: { color: "text-green-600", icon: <Sun className="w-4 h-4" />, label: "매우 긍정적" },
  POSITIVE: { color: "text-green-400", icon: <Sun className="w-4 h-4" />, label: "긍정적" },
  NEUTRAL: { color: "text-gray-500", icon: <Brain className="w-4 h-4" />, label: "중립적" },
  NEGATIVE: { color: "text-orange-500", icon: <Cloud className="w-4 h-4" />, label: "부정적" },
  VERY_NEGATIVE: { color: "text-red-600", icon: <AlertCircle className="w-4 h-4" />, label: "매우 부정적" }
};

export function EmotionAnalysis({ content, className, diaryId, onAnalysisComplete }: EmotionAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [emotions, setEmotions] = useState<EmotionScore[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (content && content.length > 10) {
      analyzeEmotion(content);
    }
  }, [content]);

  const analyzeEmotion = async (text: string) => {
    setIsAnalyzing(true);
    setError("");
    
    try {
      const result = await aiAPI.analyzeEmotion(text);
      setAnalysisResult(result);
      
      // Convert emotion breakdown to display format
      const emotionScores: EmotionScore[] = [];
      
      if (result.emotionBreakdown) {
        Object.entries(result.emotionBreakdown).forEach(([emotion, score]) => {
          if (score > 0) {
            emotionScores.push({
              emotion,
              score: Math.round(score * 100),
              color: emotionConfig[emotion]?.color || "text-gray-500",
              icon: emotionConfig[emotion]?.icon || <Brain className="w-4 h-4" />
            });
          }
        });
      }
      
      emotionScores.sort((a, b) => b.score - a.score);
      setEmotions(emotionScores);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
    } catch (err) {
      console.error('Emotion analysis failed:', err);
      setError("감정 분석 중 오류가 발생했습니다");
      
      // Fallback to basic analysis
      await fallbackAnalysis(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fallbackAnalysis = async (text: string) => {
    // Basic keyword-based analysis as fallback
    const emotionKeywords = {
      joy: ["행복", "기쁘", "즐거", "웃음", "신나", "좋아", "만족"],
      sadness: ["슬프", "우울", "힘들", "아프", "눈물", "걱정"],
      anger: ["화나", "짜증", "분노", "열받", "스트레스", "답답"],
      anxiety: ["불안", "걱정", "긴장", "두려", "무서", "떨려"],
      satisfaction: ["만족", "성공", "완벽", "훌륭", "좋은", "괜찮"]
    };

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
  };

  if (!content || content.length < 10) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI 감정 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            일기 내용을 10자 이상 작성하면 AI 감정 분석이 시작됩니다
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
          AI 감정 분석
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
          )}
          {analysisResult?.aiEnhanced && (
            <Badge variant="secondary" className="text-xs">AI 강화</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-center p-3 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-4">
            {/* 주요 감정 및 점수 */}
            <div className="text-center p-4 bg-accent/20 rounded-lg border border-accent/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={emotionConfig[analysisResult.dominantEmotion]?.color}>
                  {emotionConfig[analysisResult.dominantEmotion]?.icon}
                </span>
                <span className="font-medium">
                  {emotionConfig[analysisResult.dominantEmotion]?.label}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>감정 점수: {analysisResult.emotionScore.toFixed(1)}</span>
                <span>신뢰도: {Math.round(analysisResult.confidence * 100)}%</span>
              </div>
            </div>

            {/* 재정 감정 점수 */}
            {analysisResult.financialEmotionScore !== 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">재정 관련 감정</span>
                </div>
                <Badge variant={analysisResult.financialEmotionScore > 0 ? "default" : "destructive"}>
                  {analysisResult.financialEmotionScore > 0 ? "긍정적" : "부정적"}
                </Badge>
              </div>
            )}

            {/* 감정 분포 */}
            {emotions.length > 0 && (
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
            )}

            {/* 감정 트리거 */}
            {analysisResult.emotionalTriggers && analysisResult.emotionalTriggers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">감정 트리거</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.emotionalTriggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI 분석 상세 */}
            {analysisResult.analysisDetails && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 {analysisResult.analysisDetails}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 기본 감정 분포 (분석 결과가 없을 때) */}
        {!analysisResult && emotions.length > 0 && (
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
        )}

        {!isAnalyzing && !analysisResult && emotions.length === 0 && !error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            감정을 분석할 수 없습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}