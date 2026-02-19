export default function NoClientsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h2 className="text-xl font-semibold text-white">No clients assigned</h2>
      <p className="max-w-md text-sm text-zinc-500">
        You don&apos;t have access to any clients yet. Ask an admin to add you in Supabase (e.g. <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">user_clients</code> or <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">memberships</code>).
      </p>
      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="text-sm text-zinc-400 underline hover:text-white"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
