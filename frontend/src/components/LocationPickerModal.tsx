import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { KakaoMapPicker } from './KakaoMapPicker';

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeName?: string;
}

interface LocationPickerModalProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  children?: React.ReactNode;
}

export function LocationPickerModal({ 
  onLocationSelect, 
  initialLocation, 
  children 
}: LocationPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="w-4 h-4 mr-2" />
            {initialLocation ? initialLocation.address : '위치 선택'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>위치 선택</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <KakaoMapPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedLocation}
            >
              선택 완료
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
