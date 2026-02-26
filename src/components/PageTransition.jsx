export default function PageTransition({ children }) {
  return (
    <div className="page-transition-container min-w-0 overflow-x-hidden">
      {children}
    </div>
  );
}