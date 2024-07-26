import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  children: React.ReactNode;
  content: string | React.ReactNode;
  asChild?: boolean;
};

export const BasicTooltip = ({ children, content, asChild }: Props) => {
  return (
    <TooltipProvider delayDuration={350}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
