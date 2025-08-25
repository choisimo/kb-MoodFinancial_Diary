import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, TrendingUp, Heart, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { aiAPI, PersonalizedRecommendation } from "@/services/api";

interface AIRecommendationsProps {
  diaryId?: number;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "감정관리": <Heart className="w-4 h-4" />,
  "재정관리": <TrendingUp className="w-4 h-4" />,
  "예산관리": <TrendingUp className="w-4 h-4" />,
  "라이프스타일": <Lightbulb className="w-4 h-4" />,
  "위험관리": <AlertTriangle className="w-4 h-4" />,
  "AI추천": <Sparkles className="w-4 h-4" />
};

const priorityColors: Record<number, string> = {
  5: "bg-red-100 text-red-700 border-red-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  1: "bg-green-100 text-green-700 border-green-200"
};

const actionTypeLabels: Record<string, string> = {
  "IMMEDIATE": "즉시 실행",
  "PREVENTIVE": "예방 조치",
  "PLANNING": "계획 수립",
  "REVIEW": "검토",
  "MAINTAIN": "유지",
  "BALANCE": "균형 조정",
  "ALERT": "주의 필요",
  "HABIT": "습관 만들기",
  "SUGGESTION": "제안사항"
};

export function AIRecommendations({ diaryId, className }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadRecommendations();
  }, [diaryId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await aiAPI.getRecommendations(diaryId);
      setRecommendations(result);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError("추천 정보를 불러오는 중 오류가 발생했습니다");
      
      // Fallback to default recommendations
      setRecommendations([
        {
          category: "감정관리",
          title: "일기 작성",
          description: "하루의 감정을 기록하여 패턴을 파악해보세요",
          actionType: "HABIT",
          priority: 3,
          aiGenerated: false
        },
        {
          category: "재정관리",
          title: "가계부 작성",
          description: "정기적인 가계부 작성으로 재정 상태를 파악해보세요",
          actionType: "HABIT",
          priority: 3,
          aiGenerated: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI 개인화 추천
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              개인화된 추천을 생성하고 있습니다...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI 개인화 추천
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-center p-3 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              추천 정보가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  priorityColors[recommendation.priority] || "bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {categoryIcons[recommendation.category] || <Lightbulb className="w-4 h-4" />}
                    <span className="font-medium text-sm">
                      {recommendation.category}
                    </span>
                    {recommendation.aiGenerated && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {actionTypeLabels[recommendation.actionType] || recommendation.actionType}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm mb-1">
                  {recommendation.title}
                </h4>
                
                <p className="text-xs opacity-80 leading-relaxed">
                  {recommendation.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: recommendation.priority }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-current opacity-60" />
                    ))}
                    {Array.from({ length: 5 - recommendation.priority }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-current opacity-20" />
                    ))}
                  </div>
                  <span className="text-xs opacity-60">
                    우선순위 {recommendation.priority}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI 서비스 상태 표시 */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI 분석 기반 개인화 추천</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              활성
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}