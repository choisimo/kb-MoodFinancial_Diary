import React from 'react';
import { OnboardingPage as OnboardingComponent } from '@/components/onboarding/OnboardingPage';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      
      // 먼저 온보딩 데이터 전송
      const response = await fetch('/api/user-settings/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: data.nickname,
          language: data.language,
          currency: data.currency,
          notificationEnabled: data.notificationEnabled,
          dailyReminderTime: data.dailyReminderTime,
          weeklyReportEnabled: data.weeklyReportEnabled,
          monthlyReportEnabled: data.monthlyReportEnabled,
          expenseAlertEnabled: data.expenseAlertEnabled,
          targetEntriesPerWeek: data.targetEntriesPerWeek,
          savingGoal: data.savingGoal || undefined,
          targetSavingAmount: data.targetSavingAmount ? parseFloat(data.targetSavingAmount) : undefined,
          monthlyExpenseLimit: data.monthlyExpenseLimit ? parseFloat(data.monthlyExpenseLimit) : undefined,
          theme: data.theme,
          primaryColor: data.primaryColor,
          dataProcessingConsent: data.dataProcessingConsent,
          marketingConsent: data.marketingConsent,
          analyticsConsent: data.analyticsConsent,
        }),
      });

      if (!response.ok) {
        throw new Error('온보딩 설정 저장 실패');
      }

      // 프로필 이미지가 있으면 업로드
      if (data.profileImage) {
        const formData = new FormData();
        formData.append('file', data.profileImage);

        const imageResponse = await fetch('/api/files/profile-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          console.error('프로필 이미지 업로드 실패');
        }
      }

      toast({
        title: '온보딩 완료!',
        description: '무드다이어리에 오신 것을 환영합니다. 이제 다이어리를 작성해보세요!',
      });

      navigate('/dashboard');
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: '온보딩 실패',
        description: '온보딩 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  return <OnboardingComponent onComplete={handleOnboardingComplete} />;
};

export default OnboardingPage;