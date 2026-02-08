import { useStore } from './store';
import TopBar from './components/TopBar';
import ToolsPanel from './components/ToolsPanel';
import LibraryPanel from './components/LibraryPanel';
import Workspace from './components/Workspace';
import PropertiesPanel from './components/PropertiesPanel';
import MobileToolbar, { MobileDrawer } from './components/MobileToolbar';
import VectorizeModal from './components/VectorizeModal';
import Divider from './components/ui/Divider';

function App() {
  const { ui, setActiveDrawer } = useStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar />

      {/* Desktop 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools and Library (hidden on mobile) */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
          <ToolsPanel />
          <Divider />
          <LibraryPanel />
        </aside>

        {/* Center - Workspace */}
        <main className="flex-1 overflow-auto mb-14 md:mb-0 bg-gray-50">
          <Workspace />
        </main>

        {/* Right Panel - Properties (hidden on mobile) */}
        <aside className="hidden md:block w-72 bg-white border-l border-gray-200 overflow-y-auto shadow-sm">
          <PropertiesPanel />
        </aside>
      </div>

      {/* Mobile Bottom Toolbar */}
      <MobileToolbar />

      {/* Mobile Drawers */}
      <MobileDrawer
        isOpen={ui.activeDrawer === 'tools'}
        onClose={() => setActiveDrawer(null)}
        title="Tools & Library"
      >
        <ToolsPanel />
        <Divider />
        <LibraryPanel />
      </MobileDrawer>

      <MobileDrawer
        isOpen={ui.activeDrawer === 'regions' || ui.activeDrawer === 'properties'}
        onClose={() => setActiveDrawer(null)}
        title={ui.activeDrawer === 'regions' ? 'Regions' : 'Properties'}
      >
        <PropertiesPanel />
      </MobileDrawer>

      {/* Vectorize Modal */}
      <VectorizeModal />
    </div>
  );
}

export default App;

