import Link from 'next/link';

export default function DashboardPage(): JSX.Element {
  return (
    <>
      <Link href={'/editor'} className="underline">
        Editor Link
      </Link>
    </>
  );
}
