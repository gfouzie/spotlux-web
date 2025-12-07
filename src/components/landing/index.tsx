import Link from 'next/link';
import Button from '@/components/common/Button';
import { Play, Search, Star } from 'iconoir-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 lg:px-12 py-16">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Shine Your <span className="text-accent-col">Spotlight</span>
          </h1>
          <p className="text-xl lg:text-2xl text-text-col/80 mb-8 max-w-2xl mx-auto">
            The professional platform where athletes showcase their best clips
            to scouts. Think LinkedIn, but for athletic recruitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for <span className="text-accent-col">Athletes</span> &{' '}
            <span className="text-accent-col">Scouts</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-col/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play width={24} height={24} className="text-accent-col" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Showcase Highlights
              </h3>
              <p className="text-text-col/70">
                Upload and organize your best athletic moments in professional
                highlight reels.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent-col/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search width={24} height={24} className="text-accent-col" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Discovered</h3>
              <p className="text-text-col/70">
                Connect directly with scouts and recruiters looking for talent
                in your sport.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent-col/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star width={24} height={24} className="text-accent-col" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
              <p className="text-text-col/70">
                Professional profiles that highlight your skills, stats, and
                achievements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
