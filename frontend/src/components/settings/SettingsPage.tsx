import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Bell, Target, Palette, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface UserSettings {
  id: number;
  userId: number;
  language: string;
  timezone: string;
  currency: string;
  notificationEnabled: boolean;
  dailyReminderTime: string;
  weeklyReportEnabled: boolean;
  monthlyReportEnabled: boolean;
  expenseAlertEnabled: boolean;
  dailyExpenseLimit?: number;
  monthlyExpenseLimit?: number;
  targetEntriesPerWeek: number;
  showMoodStats: boolean;
  showExpenseAnalysis: boolean;
  showCorrelationInsights: boolean;
  privacyMode: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  savingGoal?: string;
  targetSavingAmount?: number;
  targetSavingDate?: string;
  theme: string;
  primaryColor: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-settings/extended', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        toast({
          title: '설정 로딩 실패',
          description: '설정을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Settings loading error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedData: Partial<UserSettings>) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-settings/extended', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
        toast({
          title: '설정 저장 완료',
          description: '설정이 성공적으로 저장되었습니다.',
        });
      } else {
        toast({
          title: '설정 저장 실패',
          description: '설정을 저장하는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePreview(data.data.imageUrl);
        toast({
          title: '프로필 이미지 업로드 완료',
          description: '프로필 이미지가 성공적으로 업데이트되었습니다.',
        });
      } else {
        toast({
          title: '업로드 실패',
          description: '이미지 업로드에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast({
        title: '오류',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const resetSettings = async () => {
    if (window.confirm('정말로 모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user-settings/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
          toast({
            title: '설정 초기화 완료',
            description: '모든 설정이 기본값으로 초기화되었습니다.',
          });
        }
      } catch (error) {
        console.error('Settings reset error:', error);
        toast({
          title: '초기화 실패',
          description: '설정 초기화에 실패했습니다.',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">설정을 불러올 수 없습니다</h2>
          <Button onClick={() => navigate('/dashboard')}>대시보드로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-2">계정 및 앱 설정을 관리하세요.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              알림
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              목표
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              외관
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              개인정보
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              고급
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>프로필 설정</CardTitle>
                <CardDescription>기본 프로필 정보와 언어 설정을 관리하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfileImageUpload(file);
                      }}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">프로필 이미지</h3>
                    <p className="text-sm text-gray-500">JPG, PNG 파일 (최대 5MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">언어</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => updateSettings({ language: value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="currency">통화</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value) => updateSettings({ currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KRW">KRW (원)</SelectItem>
                        <SelectItem value="USD">USD (달러)</SelectItem>
                        <SelectItem value="EUR">EUR (유로)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => updateSettings({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림 및 리마인더 설정을 관리하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">알림 허용</h4>
                    <p className="text-sm text-gray-500">모든 알림 기능을 활성화합니다</p>
                  </div>
                  <Checkbox
                    checked={settings.notificationEnabled}
                    onCheckedChange={(checked) => updateSettings({ notificationEnabled: checked as boolean })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time">일일 리마인더 시간</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
                    disabled={!settings.notificationEnabled}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">주간 리포트</h4>
                      <p className="text-sm text-gray-500">매주 활동 요약을 받아보세요</p>
                    </div>
                    <Checkbox
                      checked={settings.weeklyReportEnabled}
                      onCheckedChange={(checked) => updateSettings({ weeklyReportEnabled: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">월간 리포트</h4>
                      <p className="text-sm text-gray-500">매월 상세 분석 리포트를 받아보세요</p>
                    </div>
                    <Checkbox
                      checked={settings.monthlyReportEnabled}
                      onCheckedChange={(checked) => updateSettings({ monthlyReportEnabled: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">지출 알림</h4>
                      <p className="text-sm text-gray-500">지출 한도 초과 시 알림을 받아보세요</p>
                    </div>
                    <Checkbox
                      checked={settings.expenseAlertEnabled}
                      onCheckedChange={(checked) => updateSettings({ expenseAlertEnabled: checked as boolean })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily-limit">일일 지출 한도</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      value={settings.dailyExpenseLimit || ''}
                      onChange={(e) => updateSettings({ 
                        dailyExpenseLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-limit">월간 지출 한도</Label>
                    <Input
                      id="monthly-limit"
                      type="number"
                      value={settings.monthlyExpenseLimit || ''}
                      onChange={(e) => updateSettings({ 
                        monthlyExpenseLimit: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="1000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>목표 설정</CardTitle>
                <CardDescription>개인 목표와 일기 작성 목표를 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="target-entries">주간 일기 작성 목표</Label>
                  <Select 
                    value={settings.targetEntriesPerWeek.toString()} 
                    onValueChange={(value) => updateSettings({ targetEntriesPerWeek: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}회</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saving-goal">저축 목표</Label>
                  <Textarea
                    id="saving-goal"
                    value={settings.savingGoal || ''}
                    onChange={(e) => updateSettings({ savingGoal: e.target.value })}
                    placeholder="예: 내년에 유럽 여행을 위해 500만원 모으기"
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-amount">목표 저축 금액</Label>
                    <Input
                      id="target-amount"
                      type="number"
                      value={settings.targetSavingAmount || ''}
                      onChange={(e) => updateSettings({ 
                        targetSavingAmount: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="5000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-date">목표 달성 일자</Label>
                    <Input
                      id="target-date"
                      type="date"
                      value={settings.targetSavingDate || ''}
                      onChange={(e) => updateSettings({ targetSavingDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>외관 설정</CardTitle>
                <CardDescription>테마와 색상을 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">테마</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => updateSettings({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">라이트</SelectItem>
                        <SelectItem value="dark">다크</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color">메인 색상</Label>
                    <Select 
                      value={settings.primaryColor} 
                      onValueChange={(value) => updateSettings({ primaryColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">블루</SelectItem>
                        <SelectItem value="green">그린</SelectItem>
                        <SelectItem value="purple">퍼플</SelectItem>
                        <SelectItem value="red">레드</SelectItem>
                        <SelectItem value="orange">오렌지</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">표시 설정</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">감정 통계 표시</h5>
                      <p className="text-sm text-gray-500">대시보드에 감정 분석 차트를 표시합니다</p>
                    </div>
                    <Checkbox
                      checked={settings.showMoodStats}
                      onCheckedChange={(checked) => updateSettings({ showMoodStats: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">지출 분석 표시</h5>
                      <p className="text-sm text-gray-500">대시보드에 지출 분석을 표시합니다</p>
                    </div>
                    <Checkbox
                      checked={settings.showExpenseAnalysis}
                      onCheckedChange={(checked) => updateSettings({ showExpenseAnalysis: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">상관관계 인사이트 표시</h5>
                      <p className="text-sm text-gray-500">감정과 지출의 상관관계 분석을 표시합니다</p>
                    </div>
                    <Checkbox
                      checked={settings.showCorrelationInsights}
                      onCheckedChange={(checked) => updateSettings({ showCorrelationInsights: checked as boolean })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>개인정보 설정</CardTitle>
                <CardDescription>개인정보 보호 및 데이터 사용 설정을 관리하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">프라이버시 모드</h4>
                    <p className="text-sm text-gray-500">민감한 정보를 숨김 처리합니다</p>
                  </div>
                  <Checkbox
                    checked={settings.privacyMode}
                    onCheckedChange={(checked) => updateSettings({ privacyMode: checked as boolean })}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">데이터 사용 동의</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">마케팅 정보 수신 동의</h5>
                      <p className="text-sm text-gray-500">이벤트, 혜택 등의 마케팅 정보를 받아보시겠습니까?</p>
                    </div>
                    <Checkbox
                      checked={settings.marketingConsent}
                      onCheckedChange={(checked) => updateSettings({ marketingConsent: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">서비스 개선을 위한 분석 동의</h5>
                      <p className="text-sm text-gray-500">서비스 품질 향상을 위한 사용 패턴 분석에 동의합니다</p>
                    </div>
                    <Checkbox
                      checked={settings.analyticsConsent}
                      onCheckedChange={(checked) => updateSettings({ analyticsConsent: checked as boolean })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>고급 설정</CardTitle>
                <CardDescription>계정 관리 및 데이터 초기화 옵션입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-medium text-orange-800 mb-2">설정 초기화</h4>
                  <p className="text-sm text-orange-700 mb-4">
                    모든 설정을 기본값으로 초기화합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={resetSettings}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    설정 초기화
                  </Button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">계정 삭제</h4>
                  <p className="text-sm text-red-700 mb-4">
                    계정과 모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      // TODO: Implement account deletion
                      alert('계정 삭제 기능은 추후 구현 예정입니다.');
                    }}
                  >
                    계정 삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};