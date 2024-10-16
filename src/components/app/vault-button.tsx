import { ExternalLink } from '@/components/app/external-link';
import { Button } from '@/components/ui/button';
import { constants } from '@/lib/constants';
import { Icon } from '@iconify/react';

export const VaultButton = () => {
  return (
    <ExternalLink href={constants.externalLinks.beastzVault} noUnderline>
      <Button size="icon" variant="outline" className="focus-visible:ring-0">
        <Icon icon="solar:ssd-round-bold" className="text-xl" />
      </Button>
    </ExternalLink>
  );
};
