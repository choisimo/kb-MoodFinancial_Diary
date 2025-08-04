import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Shield, 
  Bell, 
  Database,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  // 프로필 설정
  username: string;
  email: string;
  bio: string;
  
  // 앱 설정
  theme: "light" | "dark" | "system";
  language: "ko" | "en";
  fontSize: "small" | "medium" | "large";
  
  // 알림 설정
  dailyReminder: boolean;
  weeklyReport: boolean;
  emotionAlerts: boolean;
  
  // 개인정보 설정
  showLocation: boolean;
  showExpenses: boolean;
  dataBackup: boolean;
  
  // 고급 설정
  emotionAnalysis: boolean;
  autoSave: boolean;
  exportFormat: "json" | "pdf" | "txt";
}

export function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    username: "일기쟁이",
    email: "diary@example.com", 
    bio: "매일 조금씩 성장하는 중입니다.",
    theme: "light",
    language: "ko",
    fontSize: "medium",
    dailyReminder: true,
    weeklyReport: true,
    emotionAlerts: false,
    showLocation: true,
    showExpenses: true,
    dataBackup: true,
    emotionAnalysis: true,
    autoSave: true,
    exportFormat: "json"
  });

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // 실제로는 API 호출하여 설정 저장
    toast({
      title: "설정이 저장되었습니다",
      description: "변경사항이 성공적으로 적용되었습니다.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "데이터 내보내기",
      description: "일기 데이터를 내보내고 있습니다...",
    });
  };

  const handleImportData = () => {
    toast({
      title: "데이터 가져오기", 
      description: "파일을 선택해주세요.",
    });
  };

  const handleDeleteAllData = () => {
    toast({
      title: "데이터 삭제",
      description: "정말로 모든 데이터를 삭제하시겠습니까?",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-diary-ink">설정</h1>
      </div>

      {/* 프로필 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            프로필 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                value={settings.username}
                onChange={(e) => handleSettingChange("username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange("email", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={settings.bio}
              onChange={(e) => handleSettingChange("bio", e.target.value)}
              placeholder="자신을 소개해보세요"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 외관 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            외관 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">테마</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value: "light" | "dark" | "system") => handleSettingChange("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      라이트
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      다크
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      시스템
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">언어</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value: "ko" | "en") => handleSettingChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontSize">글꼴 크기</Label>
              <Select 
                value={settings.fontSize} 
                onValueChange={(value: "small" | "medium" | "large") => handleSettingChange("fontSize", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">작음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="large">큼</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dailyReminder" className="text-base">매일 일기 알림</Label>
              <p className="text-sm text-muted-foreground">매일 저녁 일기 작성을 알려드려요</p>
            </div>
            <Switch 
              id="dailyReminder"
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => handleSettingChange("dailyReminder", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport" className="text-base">주간 리포트</Label>
              <p className="text-sm text-muted-foreground">일주일 간의 감정 변화와 통계를 보내드려요</p>
            </div>
            <Switch 
              id="weeklyReport"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => handleSettingChange("weeklyReport", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emotionAlerts" className="text-base">감정 경고</Label>
              <p className="text-sm text-muted-foreground">부정적인 감정이 지속될 때 알려드려요</p>
            </div>
            <Switch 
              id="emotionAlerts"
              checked={settings.emotionAlerts}
              onCheckedChange={(checked) => handleSettingChange("emotionAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 개인정보 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            개인정보 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showLocation" className="text-base">위치 정보 표시</Label>
              <p className="text-sm text-muted-foreground">일기에 위치 정보를 포함합니다</p>
            </div>
            <Switch 
              id="showLocation"
              checked={settings.showLocation}
              onCheckedChange={(checked) => handleSettingChange("showLocation", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showExpenses" className="text-base">지출 정보 표시</Label>
              <p className="text-sm text-muted-foreground">일기에 지출 정보를 포함합니다</p>
            </div>
            <Switch 
              id="showExpenses"
              checked={settings.showExpenses}
              onCheckedChange={(checked) => handleSettingChange("showExpenses", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataBackup" className="text-base">자동 백업</Label>
              <p className="text-sm text-muted-foreground">클라우드에 정기적으로 백업합니다</p>
            </div>
            <Switch 
              id="dataBackup"
              checked={settings.dataBackup}
              onCheckedChange={(checked) => handleSettingChange("dataBackup", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 고급 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            고급 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emotionAnalysis" className="text-base">감정 분석</Label>
              <p className="text-sm text-muted-foreground">일기 내용을 분석하여 감정을 파악합니다</p>
            </div>
            <Switch 
              id="emotionAnalysis"
              checked={settings.emotionAnalysis}
              onCheckedChange={(checked) => handleSettingChange("emotionAnalysis", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSave" className="text-base">자동 저장</Label>
              <p className="text-sm text-muted-foreground">작성 중인 내용을 자동으로 저장합니다</p>
            </div>
            <Switch 
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
            />
          </div>
          <Separator />
          <div>
            <Label htmlFor="exportFormat">내보내기 형식</Label>
            <Select 
              value={settings.exportFormat} 
              onValueChange={(value: "json" | "pdf" | "txt") => handleSettingChange("exportFormat", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="txt">텍스트</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            데이터 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              데이터 내보내기
            </Button>
            <Button onClick={handleImportData} variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              데이터 가져오기  
            </Button>
            <Button onClick={handleDeleteAllData} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              모든 데이터 삭제
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">통계</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">총 일기 수</p>
                <p className="font-semibold">156개</p>
              </div>
              <div>
                <p className="text-muted-foreground">데이터 크기</p>
                <p className="font-semibold">2.4MB</p>
              </div>
              <div>
                <p className="text-muted-foreground">마지막 백업</p>
                <p className="font-semibold">2시간 전</p>
              </div>
              <div>
                <p className="text-muted-foreground">가입일</p>
                <p className="font-semibold">2024.07.01</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          설정 저장
        </Button>
      </div>
    </div>
  );
}