interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-lg font-semibold mb-4 mt-8 first:mt-0 border-b border-bg-col pb-2">
      {title}
    </h2>
  );
}
