'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

interface AuthFormContainerProps {
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export default function AuthFormContainer({
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFormContainerProps) {
  const { theme } = useTheme();
  const logoSrc =
    theme === 'light' ? '/spotlux_logo_light.png' : '/spotlux_logo_dark.png';

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src={logoSrc}
            alt="Spotlux Logo"
            width={600}
            height={150}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl mb-2 text-center">SHINING ON THE FUTURE</h1>

        {/* Spotlight Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-[640px] h-8 bg-text-col/70 z-10 spotlight-oval" />

        {/* Form Container */}
        <div className="space-y-4 bg-card-col px-4 py-6 rounded-md relative z-20">
          {children}
        </div>

        {/* Footer Link */}
        {footerText && footerLinkText && footerLinkHref && (
          <div className="mt-6 text-center">
            <p className="text-text-col/70">
              {footerText}{' '}
              <a
                href={footerLinkHref}
                className="text-accent-col hover:text-accent-col/80 font-medium transition-colors"
              >
                {footerLinkText}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
