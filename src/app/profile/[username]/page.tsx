import ProfilePage from '@/components/profile/ProfilePage';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfileByUsernamePage({ params }: PageProps) {
  const { username } = await params;

  return <ProfilePage username={username} />;
}
