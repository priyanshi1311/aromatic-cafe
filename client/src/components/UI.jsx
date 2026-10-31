export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size] || sizes.md} border-2 border-[#fce7ec] border-t-[#d85d85] rounded-full animate-spin ${className}`} />
  );
};

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-[#fdf8f5] flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-slate-500 text-sm font-medium">{message}</p>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
    <div className="text-4xl mb-3">{icon || '🌸'}</div>
    <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-xs max-w-sm mb-4 leading-relaxed">{description}</p>}
    {action}
  </div>
);