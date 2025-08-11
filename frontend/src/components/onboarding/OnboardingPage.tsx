import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
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

interface OnboardingData {
  nickname: string;
  language: string;
  currency: string;
  notificationEnabled: boolean;
  dailyReminderTime: string;
  weeklyReportEnabled: boolean;
  monthlyReportEnabled: boolean;
  expenseAlertEnabled: boolean;
  targetEntriesPerWeek: number;
  savingGoal: string;
  targetSavingAmount: string;
  monthlyExpenseLimit: string;
  theme: string;
  primaryColor: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  profileImage: File | null;
}

interface OnboardingPageProps {
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [formData, setFormData] = useState<OnboardingData>({
    nickname: '',
    language: 'ko',
    currency: 'KRW',
    notificationEnabled: true,
    dailyReminderTime: '21:00',
    weeklyReportEnabled: true,
    monthlyReportEnabled: true,
    expenseAlertEnabled: true,
    targetEntriesPerWeek: 5,
    savingGoal: '',
    targetSavingAmount: '',
    monthlyExpenseLimit: '',
    theme: 'light',
    primaryColor: 'blue',
    dataProcessingConsent: false,
    marketingConsent: false,
    analyticsConsent: false,
    profileImage: null,
  });

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('profileImage', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.nickname.length >= 2;
      case 2:
        return true; // 프로필 이미지는 선택사항
      case 3:
        return true; // 기본값이 설정되어 있음
      case 4:
        return true; // 목표는 선택사항
      case 5:
        return formData.dataProcessingConsent; // 필수 동의
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    if (isStepValid(step)) {
      onComplete(formData);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>안녕하세요! 👋</CardTitle>
              <CardDescription>
                무드다이어리에 오신 것을 환영합니다. 먼저 기본 정보를 설정해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임 *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="2자 이상 입력해주세요"
                  maxLength={50}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
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
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>프로필 이미지 설정</CardTitle>
              <CardDescription>
                프로필 이미지를 설정해주세요. (선택사항)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  JPG, PNG, GIF 파일을 업로드할 수 있습니다. (최대 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                알림 및 리마인더 설정을 해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={formData.notificationEnabled}
                  onCheckedChange={(checked) => handleInputChange('notificationEnabled', checked)}
                />
                <Label htmlFor="notifications">알림 허용</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-time">일일 리마인더 시간</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={formData.dailyReminderTime}
                  onChange={(e) => handleInputChange('dailyReminderTime', e.target.value)}
                  disabled={!formData.notificationEnabled}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekly-report"
                    checked={formData.weeklyReportEnabled}
                    onCheckedChange={(checked) => handleInputChange('weeklyReportEnabled', checked)}
                  />
                  <Label htmlFor="weekly-report">주간 리포트</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monthly-report"
                    checked={formData.monthlyReportEnabled}
                    onCheckedChange={(checked) => handleInputChange('monthlyReportEnabled', checked)}
                  />
                  <Label htmlFor="monthly-report">월간 리포트</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expense-alert"
                    checked={formData.expenseAlertEnabled}
                    onCheckedChange={(checked) => handleInputChange('expenseAlertEnabled', checked)}
                  />
                  <Label htmlFor="expense-alert">지출 알림</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-entries">주간 목표 작성 횟수</Label>
                <Select 
                  value={formData.targetEntriesPerWeek.toString()} 
                  onValueChange={(value) => handleInputChange('targetEntriesPerWeek', parseInt(value))}
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
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>목표 설정</CardTitle>
              <CardDescription>
                저축 목표와 지출 한도를 설정해주세요. (선택사항)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saving-goal">저축 목표</Label>
                <Textarea
                  id="saving-goal"
                  value={formData.savingGoal}
                  onChange={(e) => handleInputChange('savingGoal', e.target.value)}
                  placeholder="예: 내년에 유럽 여행을 위해 500만원 모으기"
                  maxLength={500}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-amount">목표 저축 금액</Label>
                <Input
                  id="target-amount"
                  type="number"
                  value={formData.targetSavingAmount}
                  onChange={(e) => handleInputChange('targetSavingAmount', e.target.value)}
                  placeholder="5000000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense-limit">월간 지출 한도</Label>
                <Input
                  id="expense-limit"
                  type="number"
                  value={formData.monthlyExpenseLimit}
                  onChange={(e) => handleInputChange('monthlyExpenseLimit', e.target.value)}
                  placeholder="1000000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">테마</Label>
                  <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
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
                  <Label htmlFor="color">색상</Label>
                  <Select value={formData.primaryColor} onValueChange={(value) => handleInputChange('primaryColor', value)}>
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
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>이용약관 및 개인정보 처리방침</CardTitle>
              <CardDescription>
                서비스 이용을 위해 다음 항목에 동의해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="data-consent"
                    checked={formData.dataProcessingConsent}
                    onCheckedChange={(checked) => handleInputChange('dataProcessingConsent', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="data-consent" className="text-sm font-medium">
                      개인정보 처리 동의 (필수)
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      서비스 제공을 위한 개인정보 수집 및 이용에 동의합니다.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing-consent"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="marketing-consent" className="text-sm font-medium">
                      마케팅 정보 수신 동의 (선택)
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      이벤트, 혜택 등의 마케팅 정보를 받아보시겠습니까?
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="analytics-consent"
                    checked={formData.analyticsConsent}
                    onCheckedChange={(checked) => handleInputChange('analyticsConsent', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="analytics-consent" className="text-sm font-medium">
                      서비스 개선을 위한 분석 동의 (선택)
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      서비스 품질 향상을 위한 사용 패턴 분석에 동의합니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">단계 {step} / 5</p>
        </div>

        {renderStep()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            이전
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(step)}
            >
              다음
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!isStepValid(step)}
            >
              완료
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};