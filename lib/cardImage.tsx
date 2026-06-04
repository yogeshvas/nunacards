import { ImageResponse } from "next/og";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type CardEmployee = {
  id: string;
  name: string;
  designation: string | null;
  phone: string;
  countryCode: string;
  email: string | null;
  profileImage: string | null;
  organization: { name: string; logo: string | null };
};

function CardImage({ emp }: { emp: CardEmployee }) {
  const avatarUrl = emp.profileImage
    ?? `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(emp.name)}`;

  return (
    <div
      style={{
        display: "flex",
        width: "900px",
        height: "500px",
        background: "#09090b",
        fontFamily: "sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* left accent strip */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: "280px",
          background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 60%, #312e81 100%)",
          padding: "44px 32px 40px",
          position: "relative",
        }}
      >
        {/* decorative circles */}
        <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "-30px", right: "-30px", width: "130px", height: "130px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex" }} />

        {/* profile photo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", position: "relative" }}>
          {/* white ring */}
          <div style={{
            width: "116px", height: "116px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src={avatarUrl}
              width={104}
              height={104}
              style={{ borderRadius: "50%", objectFit: "cover", background: "#312e81" }}
            />
          </div>
        </div>

        {/* org name at bottom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", position: "relative" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", display: "flex" }}>
            Digital Card
          </div>
          <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.92)", fontWeight: 700, display: "flex", textAlign: "center" }}>
            {emp.organization.name}
          </div>
        </div>
      </div>

      {/* right content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "48px 56px",
          gap: "0px",
        }}
      >
        {/* name */}
        <div style={{ fontSize: "48px", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, display: "flex" }}>
          {emp.name}
        </div>

        {/* designation */}
        {emp.designation && (
          <div style={{ fontSize: "18px", color: "#a78bfa", fontWeight: 500, marginTop: "10px", display: "flex" }}>
            {emp.designation}
          </div>
        )}

        {/* divider */}
        <div style={{ width: "48px", height: "3px", background: "#4f46e5", marginTop: "28px", marginBottom: "28px", borderRadius: "2px", display: "flex" }} />

        {/* contact rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "16px", display: "flex" }}>📱</div>
            </div>
            <div style={{ fontSize: "16px", color: "#d4d4d8", display: "flex" }}>
              {emp.countryCode} {emp.phone}
            </div>
          </div>

          {emp.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "16px", display: "flex" }}>✉️</div>
              </div>
              <div style={{ fontSize: "16px", color: "#d4d4d8", display: "flex" }}>
                {emp.email}
              </div>
            </div>
          )}
        </div>

        {/* bottom tag */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4f46e5", display: "flex" }} />
          <div style={{ fontSize: "12px", color: "#52525b", letterSpacing: "1.5px", textTransform: "uppercase", display: "flex" }}>
            NunaCards · Connect
          </div>
        </div>
      </div>
    </div>
  );
}

async function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "nunacards/cards", resource_type: "image" }, (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
}

async function deleteCloudinaryImage(url: string): Promise<void> {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[deleteCloudinaryImage] failed to delete", publicId, err);
  }
}

export async function getOrGenerateCardImage(employeeId: string): Promise<string> {
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true, name: true, designation: true,
      phone: true, countryCode: true, email: true,
      profileImage: true, cardImageUrl: true,
      organization: { select: { name: true, logo: true } },
    },
  });

  if (!employee) throw new Error("Employee not found");

  // cache hit — return stored URL
  if (employee.cardImageUrl) return employee.cardImageUrl;

  // generate PNG
  const imageResponse = new ImageResponse(
    <CardImage emp={employee} />,
    { width: 900, height: 500 }
  );
  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  // upload to Cloudinary
  const url = await uploadBufferToCloudinary(buffer);

  // persist so next call is instant
  await prisma.user.update({ where: { id: employeeId }, data: { cardImageUrl: url } });

  return url;
}

export async function invalidateCardImage(employeeId: string): Promise<void> {
  await prisma.user.update({ where: { id: employeeId }, data: { cardImageUrl: null } });
}

// Deletes old card from Cloudinary and generates a fresh one in the background.
// Call via next/server `after()` so it doesn't block the API response.
export async function regenerateCardImage(employeeId: string, oldUrl?: string | null): Promise<void> {
  try {
    const newUrl = await getOrGenerateCardImage(employeeId);
    if (oldUrl && oldUrl !== newUrl) {
      await deleteCloudinaryImage(oldUrl);
    }
  } catch (err) {
    console.error("[regenerateCardImage]", err);
  }
}
