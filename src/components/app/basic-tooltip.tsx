import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  children: React.ReactNode;
  content: string | React.ReactNode;
  asChild?: boolean;
  className?: string;
  contentClassName?: string;
};

export const BasicTooltip = ({
  children,
  content,
  asChild,
  className,
  contentClassName,
}: Props) => {
  return (
    <TooltipProvider delayDuration={350}>
      <Tooltip>
        <TooltipTrigger className={className} asChild={asChild}>
          {children}
        </TooltipTrigger>
        <TooltipContent className={contentClassName}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
