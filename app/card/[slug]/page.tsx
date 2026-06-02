import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CardView from "./CardView";

type Props = { params: Promise<{ slug: string }> };

async function getEmployee(slug: string) {
  return prisma.user.findFirst({
    where: { slug, archived: false },
    select: {
      name: true,
      designation: true,
      email: true,
      phone: true,
      countryCode: true,
      profileImage: true,
      labels: true,
      employeeCode: true,
      slug: true,
      organization: { select: { name: true, logo: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const emp = await getEmployee(slug);
  if (!emp) return { title: "Card not found" };
  return {
    title: `${emp.name}${emp.designation ? ` · ${emp.designation}` : ""} | NunaCards`,
    description: `Connect with ${emp.name} from ${emp.organization.name}. Save contact, call, or chat on WhatsApp.`,
    openGraph: {
      title: emp.name,
      description: emp.designation ?? emp.organization.name,
      images: emp.profileImage ? [{ url: emp.profileImage }] : [],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const emp = await getEmployee(slug);
  if (!emp) notFound();
  return <CardView employee={emp} />;
}
