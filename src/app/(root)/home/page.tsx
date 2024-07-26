import { OpenFileModalProvider } from '@/app/(root)/home/_components/open-file-modal-provider';
import { DashboardRoot } from '@/app/(root)/home/_components/root';

export default async function DashboardPage(): Promise<JSX.Element> {
  return (
    <OpenFileModalProvider>
      <DashboardRoot />
    </OpenFileModalProvider>
  );
}
