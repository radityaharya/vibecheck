/* eslint-disable @typescript-eslint/consistent-type-imports */
// pages/profile.js
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default async function Profile() {
  const supabase = createClientComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/protected-page">server-side RLS</Link>]
      </p>
      {/* <div>Hello {user.email}</div> */}
      {JSON.stringify(user, null, 2)}
    </>
  );
}
