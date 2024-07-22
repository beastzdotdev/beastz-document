import Link from 'next/link';

export default async function DashboardPage(): Promise<JSX.Element> {
  return (
    <>
      <Link href={'/document/1'} className="underline">
        Doc Link 1
      </Link>
      <br />
      <Link href={'/settings'} className="underline">
        Settings
      </Link>
    </>
  );
}
