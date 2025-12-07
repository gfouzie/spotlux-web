import LoginPage from '@/components/login';
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';

export default function Login() {
  return (
    <UnauthenticatedLayout>
      <LoginPage />
    </UnauthenticatedLayout>
  );
}
