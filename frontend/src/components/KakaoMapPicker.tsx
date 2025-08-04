import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Navigation } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeName?: string;
}

interface KakaoMapPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
}

export function KakaoMapPicker({ onLocationSelect, initialLocation, className }: KakaoMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(true);

  // Kakao Map API 로드
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    
    if (!apiKey) {
      console.error('Kakao Map API 키가 설정되지 않았습니다. .env 파일에 VITE_KAKAO_MAP_KEY를 설정해주세요.');
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        initializeMap();
        setIsLoading(false);
      });
    };

    script.onerror = () => {
      console.error('Kakao Map API 로드 실패');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(
        initialLocation?.lat || 37.5665, 
        initialLocation?.lng || 126.9780
      ),
      level: 3
    };

    const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
    setMap(kakaoMap);

    // 클릭 이벤트 등록
    window.kakao.maps.event.addListener(kakaoMap, 'click', function(mouseEvent: any) {
      const latlng = mouseEvent.latLng;
      getAddressFromCoords(latlng.getLat(), latlng.getLng());
    });

    // 초기 위치에 마커 표시
    if (initialLocation) {
      addMarker(initialLocation.lat, initialLocation.lng, initialLocation.address);
    }
  };

  const addMarker = (lat: number, lng: number, address: string, placeName?: string) => {
    if (!map) return;

    // 기존 마커 제거
    if (marker) {
      marker.setMap(null);
    }

    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const newMarker = new window.kakao.maps.Marker({
      position: markerPosition
    });

    newMarker.setMap(map);
    setMarker(newMarker);

    // 지도 중심 이동
    map.setCenter(markerPosition);

    const location: Location = { lat, lng, address, placeName };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const getAddressFromCoords = (lat: number, lng: number) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.coord2Address(lng, lat, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].address.address_name;
        addMarker(lat, lng, address);
      }
    });
  };

  const searchPlaces = () => {
    if (!searchKeyword.trim() || !map) return;

    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const place = data[0];
        addMarker(
          parseFloat(place.y), 
          parseFloat(place.x), 
          place.address_name,
          place.place_name
        );
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        getAddressFromCoords(lat, lng);
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // API 키가 없는 경우 에러 표시
  if (!import.meta.env.VITE_KAKAO_MAP_KEY) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Kakao Map API 키가 설정되지 않았습니다.</p>
            <p className="text-xs text-muted-foreground">.env 파일에 VITE_KAKAO_MAP_KEY를 설정해주세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          위치 선택
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색 */}
        <div className="flex gap-2">
          <Input
            placeholder="장소명 또는 주소 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
            className="flex-1"
          />
          <Button onClick={searchPlaces} size="icon" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
          <Button onClick={getCurrentLocation} size="icon" variant="outline">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* 지도 */}
        <div 
          ref={mapContainer} 
          className="w-full h-64 rounded-lg border border-diary-border"
        />

        {/* 선택된 위치 정보 */}
        {selectedLocation && (
          <div className="p-3 bg-accent/20 rounded-lg border border-accent/30">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-accent-foreground mt-0.5" />
              <div>
                {selectedLocation.placeName && (
                  <p className="font-medium text-accent-foreground">
                    {selectedLocation.placeName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.address}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}