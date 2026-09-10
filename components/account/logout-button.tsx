import { LogOut } from "lucide-react";
import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="mt-2 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-medium text-error hover:bg-cream"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </form>
  );
}
