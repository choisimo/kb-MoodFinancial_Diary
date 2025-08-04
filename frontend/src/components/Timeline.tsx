import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DiaryCard } from "./DiaryCard";
import { DiaryEntry } from "@/types/diary";
import { 
  Search, 
  Filter, 
  Calendar,
  Grid3X3,
  List,
  ChevronDown,
  SortAsc,
  SortDesc
} from "lucide-react";

interface TimelineProps {
  entries: DiaryEntry[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

type ViewMode = "grid" | "list";
type SortOption = "date-desc" | "date-asc" | "title" | "expenses";

const moodFilters = [
  { value: "all", label: "전체", emoji: "🌈" },
  { value: "happy", label: "행복", emoji: "😊" },
  { value: "sad", label: "슬픔", emoji: "😢" },
  { value: "neutral", label: "보통", emoji: "😐" },
  { value: "excited", label: "신남", emoji: "🤩" },
  { value: "tired", label: "피곤", emoji: "😴" }
];

export function Timeline({ entries, onEdit, onDelete }: TimelineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // 필터링 및 정렬
  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMood = selectedMood === "all" || entry.mood === selectedMood;
      
      return matchesSearch && matchesMood;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "expenses":
          return (b.expenses || 0) - (a.expenses || 0);
        default:
          return 0;
      }
    });

  // 월별 그룹화
  const groupedEntries = filteredAndSortedEntries.reduce((groups, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        label: monthLabel,
        entries: []
      };
    }
    groups[monthKey].entries.push(entry);
    return groups;
  }, {} as Record<string, { label: string; entries: DiaryEntry[] }>);

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 헤더 */}
      <Card className="bg-diary-paper border-diary-border shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* 검색바 및 뷰 옵션 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="일기 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-diary-border"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-accent" : ""}
                >
                  <Filter className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* 필터 옵션 */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-diary-border">
                {/* 기분 필터 */}
                <div>
                  <label className="text-sm font-medium text-diary-ink mb-2 block">기분별 필터</label>
                  <div className="flex flex-wrap gap-2">
                    {moodFilters.map((mood) => (
                      <Badge
                        key={mood.value}
                        variant={selectedMood === mood.value ? "default" : "secondary"}
                        className="cursor-pointer hover:scale-105 transition-smooth px-3 py-1"
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        {mood.emoji} {mood.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 정렬 옵션 */}
                <div>
                  <label className="text-sm font-medium text-diary-ink mb-2 block">정렬</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortBy === "date-desc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("date-desc")}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      최신순
                    </Button>
                    <Button
                      variant={sortBy === "date-asc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("date-asc")}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      오래된순
                    </Button>
                    <Button
                      variant={sortBy === "title" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("title")}
                    >
                      <SortAsc className="w-4 h-4 mr-1" />
                      제목순
                    </Button>
                    <Button
                      variant={sortBy === "expenses" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("expenses")}
                    >
                      <SortDesc className="w-4 h-4 mr-1" />
                      지출순
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 일기 목록 */}
      {Object.entries(groupedEntries).length === 0 ? (
        <Card className="bg-diary-paper border-diary-border shadow-card">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-diary-ink mb-2">
              {searchTerm || selectedMood !== "all" ? "검색 결과가 없습니다" : "아직 작성된 일기가 없어요"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedMood !== "all" 
                ? "다른 검색어나 필터를 시도해보세요" 
                : "첫 번째 일기를 작성해보세요!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([monthKey, group]) => (
            <div key={monthKey} className="space-y-4">
              {/* 월 헤더 */}
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-diary-ink">{group.label}</h2>
                <div className="flex-1 h-px bg-diary-border"></div>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {group.entries.length}개
                </Badge>
              </div>

              {/* 일기 카드들 */}
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {group.entries.map((entry) => (
                  <DiaryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}