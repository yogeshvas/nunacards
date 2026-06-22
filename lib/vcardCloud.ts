import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { buildVCard } from "@/lib/vcard";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Generates the employee's .vcf and hosts it on Cloudinary as a public raw file,
// returning a URL WhatsApp/AiSensy can actually fetch (our own /api route is only
// reachable on localhost in dev, which WhatsApp cannot download from).
//
// Uses a deterministic public_id per employee + overwrite, so re-sends refresh
// the same file instead of creating duplicates.
export async function getOrGenerateVCardUrl(employeeId: string): Promise<string> {
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      name: true,
      designation: true,
      email: true,
      phone: true,
      countryCode: true,
      profileImage: true,
      organization: { select: { name: true } },
    },
  });

  if (!employee) throw new Error("Employee not found");

  const buffer = Buffer.from(buildVCard(employee), "utf-8");

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "nunacards/vcards",
          resource_type: "raw",
          public_id: employeeId,
          format: "vcf",
          overwrite: true,
          invalidate: true,
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Cloudinary vCard upload failed"));
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}
