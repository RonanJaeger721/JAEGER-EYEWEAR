import { auth } from "@/auth";
import { readState } from "@/lib/db";
import { AdminDashboard } from "@/components/admin";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Management | JAEGER EYEWEAR",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const session = process.env.AUTH_SECRET ? await auth() : null;
  const s = await readState();
  const user = s.users.find(
    (u) =>
      u.id === session?.user?.id &&
      !u.disabled &&
      ["admin", "editor"].includes(u.role),
  );
  if (!user)
    return (
      <section className="section restricted">
        <span className="eyebrow">JAEGER EYEWEAR / PRIVATE WORKSPACE</span>
        <h1>
          A considered
          <br />
          space to manage.
        </h1>
        <p>Authorized team access is required.</p>
        <Link className="button" href="/account?next=/admin">
          Sign in to management ↗
        </Link>
      </section>
    );
  return <AdminDashboard />;
}
