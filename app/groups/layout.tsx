import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Grupos | Poolift" };

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
