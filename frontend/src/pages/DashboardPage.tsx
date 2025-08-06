import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LogOut, User, Mail, Calendar, Shield, Heart, PlusCircle, BookOpen } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getInitials = (nickname: string) => {
    return nickname.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'LOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">KB 무드 금융 다이어리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">안녕하세요, {user.nickname}님!</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  사용자 프로필
                </CardTitle>
                <CardDescription>
                  계정 정보 및 설정
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profileImageUrl} alt={user.nickname} />
                    <AvatarFallback>{getInitials(user.nickname)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-medium">{user.nickname}</h3>
                      {user.firstName && user.lastName && (
                        <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                      {user.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800">인증됨</Badge>
                      ) : (
                        <Badge variant="destructive">미인증</Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'ADMIN' ? '관리자' : '사용자'}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === 'ACTIVE' ? '활성' : 
                         user.status === 'INACTIVE' ? '비활성' : '잠김'}
                      </Badge>
                    </div>

                    {user.provider && (
                      <div className="text-sm text-gray-600">
                        소셜 로그인: {user.provider === 'GOOGLE' ? 'Google' : 'Kakao'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  계정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">가입일</p>
                  <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">최근 업데이트</p>
                  <p className="text-sm text-gray-600">{formatDate(user.updatedAt)}</p>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">마지막 로그인</p>
                    <p className="text-sm text-gray-600">{formatDate(user.lastLoginAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
                <CardDescription>
                  자주 사용하는 기능들에 빠르게 접근하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-blue-50"
                    onClick={() => navigate('/mood-diaries/write')}
                  >
                    <PlusCircle className="h-6 w-6 mb-2 text-blue-600" />
                    <div className="text-lg font-semibold">새 일기 작성</div>
                    <div className="text-sm text-gray-600">오늘의 기분을 기록해보세요</div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-green-50"
                    onClick={() => navigate('/mood-diaries')}
                  >
                    <BookOpen className="h-6 w-6 mb-2 text-green-600" />
                    <div className="text-lg font-semibold">일기 목록</div>
                    <div className="text-sm text-gray-600">작성한 일기들을 확인하세요</div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-purple-50"
                    onClick={() => alert('가계부 기능은 준비 중입니다!')}
                  >
                    <Heart className="h-6 w-6 mb-2 text-purple-600" />
                    <div className="text-lg font-semibold">분석 보기</div>
                    <div className="text-sm text-gray-600">무드와 소비 패턴을 분석하세요</div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
