export const FirebaseLabel = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <div className={`hidden xl:block fixed bg-[#FFFBCC] p-3 text-[11px] font-mono text-gray-800 shadow-lg border border-[#E0E7E6] rotate-1 z-[60] rounded-sm pointer-events-none max-w-[220px] ${className}`}>
      <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-400/80 rounded-full shadow-sm" />
      {text}
    </div>
  );
};
