import React, { useEffect, useRef, useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { MapPin, Search } from 'lucide-react';
import { Input } from './input';

// Kakao Maps API 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  location?: string;
  onLocationSelect?: (location: string, lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
  className?: string;
}

interface Place {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({
  location,
  onLocationSelect,
  readonly = false,
  height = '300px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(location || '');

  useEffect(() => {
    if (!window.kakao || !mapContainer.current) return;

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
        level: 3
      };

      const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(mapInstance);

      // 기존 위치가 있으면 표시
      if (location) {
        searchAndDisplayLocation(location, mapInstance);
      }
    });
  }, [location]);

  const searchAndDisplayLocation = async (keyword: string, mapInstance?: any) => {
    if (!window.kakao || !keyword.trim()) return;

    const targetMap = mapInstance || map;
    if (!targetMap) return;

    const ps = new window.kakao.maps.services.Places();
    
    ps.keywordSearch(keyword, (data: Place[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const coords = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
        
        // 지도 중심 이동
        targetMap.setCenter(coords);
        
        // 기존 마커 제거
        if (marker) {
          marker.setMap(null);
        }
        
        // 새 마커 생성
        const newMarker = new window.kakao.maps.Marker({
          position: coords,
          map: targetMap
        });
        
        setMarker(newMarker);
        setSelectedLocation(place.place_name);
        
        if (onLocationSelect && !readonly) {
          onLocationSelect(place.place_name, parseFloat(place.y), parseFloat(place.x));
        }
      }
    });
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    
    setIsSearching(true);
    const ps = new window.kakao.maps.services.Places();
    
    ps.keywordSearch(searchKeyword, (data: Place[], status: any) => {
      setIsSearching(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data.slice(0, 5)); // 상위 5개만 표시
      } else {
        setSearchResults([]);
      }
    });
  };

  const handlePlaceSelect = (place: Place) => {
    const coords = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
    
    if (map) {
      map.setCenter(coords);
      
      // 기존 마커 제거
      if (marker) {
        marker.setMap(null);
      }
      
      // 새 마커 생성
      const newMarker = new window.kakao.maps.Marker({
        position: coords,
        map: map
      });
      
      setMarker(newMarker);
    }
    
    setSelectedLocation(place.place_name);
    setSearchResults([]);
    setSearchKeyword('');
    
    if (onLocationSelect && !readonly) {
      onLocationSelect(place.place_name, parseFloat(place.y), parseFloat(place.x));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {!readonly && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="장소를 검색해보세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchKeyword.trim()}
              size="sm"
            >
              {isSearching ? '검색중...' : '검색'}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <Card className="p-2 max-h-40 overflow-y-auto">
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm border-b last:border-b-0"
                >
                  <div className="font-medium">{place.place_name}</div>
                  <div className="text-gray-500 text-xs">
                    {place.road_address_name || place.address_name}
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>
      )}
      
      {selectedLocation && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <MapPin className="h-4 w-4" />
          <span>{selectedLocation}</span>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        style={{ height }}
        className="w-full rounded-lg border overflow-hidden"
      />
    </div>
  );
};
