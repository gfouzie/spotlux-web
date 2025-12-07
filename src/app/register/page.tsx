import RegisterPage from '@/components/register';
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';

export default function Register() {
  return (
    <UnauthenticatedLayout>
      <RegisterPage />
    </UnauthenticatedLayout>
  );
}
