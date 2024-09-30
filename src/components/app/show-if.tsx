export const Show = ({ if: condition, children }: { if: boolean; children: React.ReactNode }) => {
  return condition ? <>{children}</> : null;
};
