import { ChatLines, Tools, StatsUpSquare, FolderSettings } from 'iconoir-react';

export const superuserNavigationItems = [
  {
    name: 'Internal Tools',
    href: '/internal-tools',
    icon: StatsUpSquare,
    children: [
      { name: 'Prompts', href: '/internal-tools/prompts', icon: ChatLines },
      {
        name: 'Prompt Categories',
        href: '/internal-tools/prompt-categories',
        icon: FolderSettings,
      },
      {
        name: 'Team Creation',
        href: '/internal-tools/team-creation',
        icon: Tools,
      },
    ],
  },
] as const;
