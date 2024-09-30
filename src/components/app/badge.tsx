export const Badge = ({ children, text }: { children?: React.ReactNode; text?: string }) => {
  return (
    <span className="text-sm text-accent text-nowrap tracking-tight bg-primary px-2 py-0.5 rounded-2xl">
      {text}
      {children}
    </span>
  );
};
