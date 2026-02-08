interface PanelHeaderProps {
  children: React.ReactNode;
}

export default function PanelHeader({ children }: PanelHeaderProps) {
  return (
    <h2 className="text-sm font-semibold text-gray-800">
      {children}
    </h2>
  );
}
