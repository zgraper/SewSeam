import { Wrench, Grid3x3, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store';
import type { DrawerType } from '../store';

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
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
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute bottom-14 left-0 right-0 bg-white rounded-t-xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
