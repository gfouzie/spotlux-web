'use client';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { ChatLines, Tools, FolderSettings } from 'iconoir-react';
import Link from 'next/link';

const internalToolsCards = [
  {
    name: 'Prompts',
    href: '/internal-tools/prompts',
    icon: ChatLines,
    description:
      'Create and manage prompts for different sports and categories',
  },
  {
    name: 'Prompt Categories',
    href: '/internal-tools/prompt-categories',
    icon: FolderSettings,
    description: 'Organize prompts by creating and managing categories',
  },
  {
    name: 'Team Creation',
    href: '/internal-tools/team-creation',
    icon: Tools,
    description: 'Development utilities for creating and managing teams',
  },
];

export default function InternalToolsPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="mb-2">
            Internal Tools
          </h1>
          <p className="text-text-col/60">
            Administrative tools and utilities for managing the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internalToolsCards.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="block p-6 bg-bg-col/30 rounded-lg border border-bg-col hover:bg-bg-col/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2">
                      {tool.name}
                    </h2>
                    <p className="text-text-col/60 text-sm">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
