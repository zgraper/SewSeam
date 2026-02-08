import { Wrench, Grid3x3, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store';
import type { DrawerType } from '../store';
import { useEffect } from 'react';

export default function MobileToolbar() {
  const { ui, setActiveDrawer } = useStore();

  const handleToolbarClick = (drawer: DrawerType) => {
    if (ui.activeDrawer === drawer) {
      setActiveDrawer(null);
    } else {
      setActiveDrawer(drawer);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        <button
          onClick={() => handleToolbarClick('tools')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            ui.activeDrawer === 'tools' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Wrench size={20} />
          <span className="text-xs mt-1">Tools</span>
        </button>

        <button
          onClick={() => handleToolbarClick('regions')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            ui.activeDrawer === 'regions' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Grid3x3 size={20} />
          <span className="text-xs mt-1">Regions</span>
        </button>

        <button
          onClick={() => handleToolbarClick('properties')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            ui.activeDrawer === 'properties' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
        >
          <SlidersHorizontal size={20} />
          <span className="text-xs mt-1">Properties</span>
        </button>
      </div>
    </div>
  );
}

interface DrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function MobileDrawer({ children, isOpen, onClose, title }: DrawerProps) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Backdrop with fade-in animation */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer with slide-up animation */}
      <div className="absolute bottom-14 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up pb-[env(safe-area-inset-bottom)]">
        {/* Draggable handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 text-center">{title}</h2>
        </div>

        {/* Content with internal scrolling */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
