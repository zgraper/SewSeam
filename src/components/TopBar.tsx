import { useStore, getStatusMessage } from '../store';

export default function TopBar() {
  const reset = useStore((state) => state.reset);
  const statusMessage = useStore(getStatusMessage);

  return (
    <div className="sticky top-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-800">SewSeam</h1>
        <span className="text-xs text-gray-500 border-l border-gray-300 pl-3">
          {statusMessage}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          New Project
        </button>
        <button
          disabled
          className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
