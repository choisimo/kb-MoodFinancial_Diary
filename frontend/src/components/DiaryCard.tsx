import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { DiaryEntry } from "@/types/diary";

interface DiaryCardProps {
  entry: DiaryEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const moodEmojis = {
  happy: "😊",
  sad: "😢", 
  neutral: "😐",
  excited: "🤩",
  tired: "😴"
};

const moodColors = {
  happy: "bg-gradient-primary",
  sad: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-800", 
  excited: "bg-gradient-secondary",
  tired: "bg-purple-100 text-purple-800"
};

export function DiaryCard({ entry, onEdit, onDelete }: DiaryCardProps) {
  return (
    <Card className="diary-card bg-diary-paper border-diary-border shadow-diary hover:shadow-xl transition-smooth hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodColors[entry.mood]} text-lg`}>
              {moodEmojis[entry.mood]}
            </div>
            <div>
              <CardTitle className="text-diary-ink text-lg font-semibold">{entry.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(entry.date).toLocaleDateString('ko-KR')}</span>
                {entry.location && (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>{entry.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(entry.id)}
              className="h-8 w-8 hover:bg-accent"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(entry.id)}
              className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-diary-ink leading-relaxed mb-4 line-clamp-3">
          {entry.content}
        </p>
        
        {entry.images && entry.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {entry.images.slice(0, 2).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`일기 이미지 ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-diary-border"
              />
            ))}
            {entry.images.length > 2 && (
              <div className="col-span-2 text-center text-sm text-muted-foreground">
                +{entry.images.length - 2}개 더
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-accent text-accent-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
          
          {entry.expenses && (
            <div className="flex items-center gap-1 text-finance-warning font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{entry.expenses.toLocaleString()}원</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}