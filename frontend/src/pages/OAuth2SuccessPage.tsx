import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuth2SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth2Success = async () => {
      try {
        console.log('OAuth2 Success Page - Processing callback');
        console.log('Search params:', location.search);
        
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const tokenType = searchParams.get('tokenType');
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const nickname = searchParams.get('nickname');
        
        console.log('Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, userId, email, nickname });

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in OAuth2 callback');
          navigate('/login?error=oauth_failed');
          return;
        }

        // 사용자 정보 구성 (UserProfile 타입에 맞게)
        const user = {
          id: parseInt(userId || '0'),
          email: decodeURIComponent(email || ''),
          nickname: decodeURIComponent(nickname || ''),
          emailVerified: true, // OAuth2로 로그인했으므로 이메일 인증됨
          role: 'USER', // 기본 역할
          status: 'ACTIVE', // 기본 상태
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('Calling login with:', { accessToken: '***', refreshToken: '***', user });

        // AuthContext를 통해 로그인 처리
        await login({
          accessToken,
          refreshToken,
          tokenType: tokenType || 'Bearer',
          expiresIn: 86400, // 24시간 (기본값)
          user
        });

        console.log('Login successful, redirecting to dashboard');
        // 대시보드로 리다이렉트
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth2 login processing failed:', error);
        navigate('/login?error=oauth_processing_failed');
      }
    };

    processOAuth2Success();
  }, [searchParams, navigate, login, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            로그인 처리 중...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            OAuth2 로그인을 완료하고 있습니다. 잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuth2SuccessPage;
