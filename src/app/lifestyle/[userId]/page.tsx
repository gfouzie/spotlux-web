"use client";

import { use } from "react";
import LifestylePage from "@/components/lifestyle/LifestylePage";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

const Page = ({ params }: PageProps) => {
  const { userId } = use(params);
  const userIdNumber = parseInt(userId, 10);

  return <LifestylePage userId={userIdNumber} />;
};

export default Page;
