import { InstagramIcon } from "@/components/icons/social-icons";

function handleFromUrl(url: string) {
  const handle = url.replace(/\/+$/, "").split("/").pop();
  return handle ? `@${handle}` : "Instagram";
}

/** Rendered only when the store's real Instagram URL is set in Admin → Settings. */
export function InstagramSection({ instagramUrl }: { instagramUrl: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <InstagramIcon className="mx-auto h-8 w-8 text-maroon-600" strokeWidth={1.5} />
      <h2 className="font-display mt-3 text-2xl font-semibold text-charcoal sm:text-3xl">Follow Us on Instagram</h2>
      <p className="mt-2 text-sm text-ink-600">Daily new arrivals, styling ideas and behind-the-scenes.</p>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm font-medium text-maroon-600 hover:underline"
      >
        {handleFromUrl(instagramUrl)} →
      </a>
    </section>
  );
}
