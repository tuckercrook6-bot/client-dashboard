import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <SignupForm />
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-black">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
