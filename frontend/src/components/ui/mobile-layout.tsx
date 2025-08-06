import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  rightAction,
  className = '',
  headerClassName = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      {(title || showBackButton || rightAction) && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 ${headerClassName}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-2 h-auto"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>
            {rightAction && (
              <div className="flex items-center">
                {rightAction}
              </div>
            )}
          </div>
        </motion.header>
      )}

      {/* Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </div>
  );
};

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingClasses[padding]} ${
        onClick ? 'cursor-pointer active:bg-gray-50' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface MobileFabProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}

export const MobileFab: React.FC<MobileFabProps> = ({
  onClick,
  icon,
  className = ''
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 ${className}`}
    >
      {icon}
    </motion.button>
  );
};
