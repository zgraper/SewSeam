import { useStore } from '../store';

export default function TopBar() {
  const reset = useStore((state) => state.reset);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">SewSeam</h1>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          New Project
        </button>
        <button
          disabled
          className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
