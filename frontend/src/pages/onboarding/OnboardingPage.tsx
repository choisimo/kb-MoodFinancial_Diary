import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Bell, Target, Clock, Shield, User, CheckCircle } from 'lucide-react';
import api from '@/services/api';

const onboardingSchema = z.object({
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').max(100, '닉네임은 100자 이하여야 합니다'),
  targetEntriesPerWeek: z.number().min(1).max(7),
  dailyReminderTime: z.string(),
  notificationEnabled: z.boolean(),
  privacyMode: z.boolean(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      targetEntriesPerWeek: 5,
      dailyReminderTime: '21:00',
      notificationEnabled: true,
      privacyMode: false,
    },
  });

  const watchedValues = watch();
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Update user settings
      await api.put('/user-settings', {
        notificationEnabled: data.notificationEnabled,
        dailyReminderTime: data.dailyReminderTime,
        targetEntriesPerWeek: data.targetEntriesPerWeek,
        privacyMode: data.privacyMode,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || '설정 저장에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 mx-auto text-blue-600" />
              <h2 className="text-2xl font-bold">환영합니다!</h2>
              <p className="text-gray-600">감정 다이어리를 시작하기 위해 몇 가지 설정을 해보겠습니다.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  placeholder="사용할 닉네임을 입력해주세요"
                  {...register('nickname')}
                  className={errors.nickname ? 'border-red-500' : ''}
                />
                {errors.nickname && (
                  <p className="text-sm text-red-500">{errors.nickname.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 mx-auto text-green-600" />
              <h2 className="text-2xl font-bold">목표 설정</h2>
              <p className="text-gray-600">일주일에 몇 번 정도 일기를 작성하고 싶으신가요?</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetEntriesPerWeek">주간 목표 (일기 작성 횟수)</Label>
                <Select
                  value={watchedValues.targetEntriesPerWeek?.toString()}
                  onValueChange={(value) => setValue('targetEntriesPerWeek', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="목표를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        주 {num}회
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 꾸준한 기록이 중요해요! 무리하지 않는 선에서 목표를 설정해보세요.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Bell className="w-12 h-12 mx-auto text-purple-600" />
              <h2 className="text-2xl font-bold">알림 설정</h2>
              <p className="text-gray-600">일기 작성을 잊지 않도록 도움을 드릴게요.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">일기 작성 알림</div>
                  <div className="text-sm text-gray-600">매일 정해진 시간에 알림을 받습니다</div>
                </div>
                <Switch
                  checked={watchedValues.notificationEnabled}
                  onCheckedChange={(checked) => setValue('notificationEnabled', checked)}
                />
              </div>

              {watchedValues.notificationEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="dailyReminderTime">알림 시간</Label>
                  <Input
                    id="dailyReminderTime"
                    type="time"
                    {...register('dailyReminderTime')}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 mx-auto text-red-600" />
              <h2 className="text-2xl font-bold">개인정보 보호</h2>
              <p className="text-gray-600">마지막으로 개인정보 보호 설정을 확인해주세요.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">프라이버시 모드</div>
                  <div className="text-sm text-gray-600">활성화하면 추가적인 보안 기능이 적용됩니다</div>
                </div>
                <Switch
                  checked={watchedValues.privacyMode}
                  onCheckedChange={(checked) => setValue('privacyMode', checked)}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">설정 완료!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  모든 설정이 완료되었습니다. 언제든지 설정에서 변경할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">초기 설정</CardTitle>
            <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
          </div>
          <Progress value={progress} className="w-full" />
          <CardDescription>
            감정 다이어리를 시작하기 위한 설정입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  이전
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    다음
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? '저장 중...' : '완료'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;