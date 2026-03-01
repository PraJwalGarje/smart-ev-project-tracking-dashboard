export default function PageTransition({ children }) {
  return (
    <div className="page-transition-container min-w-0 overflow-x-clip overflow-y-visible">
      {children}
    </div>
  );
}