import { OpenFileModalProvider } from '@/app/(auth)/(root)/home/_components/open-file-modal-provider';
import { DashboardRoot } from '@/app/(auth)/(root)/home/_components/root';

export const runtime = 'edge';

export default async function DashboardPage(): Promise<JSX.Element> {
  return (
    <OpenFileModalProvider>
      <DashboardRoot />
    </OpenFileModalProvider>
  );
}
