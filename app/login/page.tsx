import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { isAdminEmail, getRoleForUserId } from "@/lib/auth-role";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const supabase = await createClient();
  let loggedInUser: { email: string; role: "admin" | "client" } | null = null;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) {
      const role = isAdminEmail(data.session.user.email) ? "admin" : await getRoleForUserId(data.session.user.id, data.session.user.email);
      loggedInUser = { email: data.session.user.email ?? "", role };
    }
  }

  const { next, error } = await searchParams;

  if (loggedInUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-white">You’re signed in</h1>
          <p className="text-sm text-zinc-400">{loggedInUser.email}</p>
          <div className="flex flex-col gap-2">
            <Link
              href={loggedInUser.role === "admin" ? "/admin" : "/dashboard"}
              className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              {loggedInUser.role === "admin" ? "Go to Admin" : "Go to Dashboard"}
            </Link>
            <form action="/auth/logout" method="POST" className="pt-2">
              <button type="submit" className="text-sm text-zinc-500 underline hover:text-zinc-300">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-sm text-zinc-500">Email and password</p>
        <LoginForm next={next} />
        <p className="text-center text-sm text-zinc-500">
          No account?{" "}
          <a href="/signup" className="text-white underline hover:text-zinc-300">
            Create one
          </a>
        </p>
        {error && (
          <p className="text-sm text-red-400">
            {error === "auth_callback_error"
              ? "Sign-in failed. Try again."
              : "Something went wrong."}
          </p>
        )}
      </div>
    </div>
  );
}
