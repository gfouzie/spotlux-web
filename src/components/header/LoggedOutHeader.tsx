import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoggedOutHeader() {
  const { theme } = useTheme();

  const logoSrc =
    theme === 'light' ? '/spotlux_logo_light.png' : '/spotlux_logo_dark.png';

  console.log(logoSrc);
  return (
    <header className="flex justify-between items-center p-4 lg:p-6 lg:px-12 bg-bg-col text-text-col">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <Image
          src={logoSrc}
          alt="Spotlux Logo"
          width={120}
          height={30}
          className="object-contain lg:w-[180px] lg:h-[45px]"
          priority
        />
      </Link>

      <div className="flex items-center gap-2 lg:gap-4">
        <Link
          href="/register"
          className="text-text-col hover:text-accent-col transition-colors font-medium text-sm lg:text-base"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="bg-accent-col text-bg-col px-3 py-1.5 lg:px-6 lg:py-2 rounded-lg font-semibold hover:bg-accent-col/90 transition-colors text-sm lg:text-base"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}
