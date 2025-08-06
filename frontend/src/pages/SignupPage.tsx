import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Check, X } from 'lucide-react';
import { authAPI, SignupRequest } from '../services/api';

const signupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'),
  confirmPassword: z.string(),
  nickname: z.string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자까지 가능합니다'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const email = watch('email');

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setCheckingEmail(true);
    try {
      const response = await authAPI.checkEmailAvailability(email);
      setEmailAvailable(response.data);
    } catch (err) {
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email) {
        checkEmailAvailability(email);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const signupData: SignupRequest = {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      };

      const response = await authAPI.signup(signupData);
      if (response.success) {
        setSuccess('회원가입이 완료되었습니다! 이메일 인증을 확인해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            KB 무드 금융 다이어리 계정을 만들어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {checkingEmail && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                )}
                {!checkingEmail && emailAvailable === true && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
                {!checkingEmail && emailAvailable === false && (
                  <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              {emailAvailable === false && (
                <p className="text-sm text-red-500">이미 사용 중인 이메일입니다</p>
              )}
              {emailAvailable === true && (
                <p className="text-sm text-green-500">사용 가능한 이메일입니다</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                {...register('nickname')}
                className={errors.nickname ? 'border-red-500' : ''}
              />
              {errors.nickname && (
                <p className="text-sm text-red-500">{errors.nickname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || emailAvailable === false}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  회원가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
