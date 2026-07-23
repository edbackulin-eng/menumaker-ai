/**
 * Embeds a JSON-LD object as a `<script type="application/ld+json">`.
 *
 * `<` is escaped to `<` before serializing — the standard guard for
 * this pattern (Next.js's own docs recommend it). Without it, data that
 * legitimately contains `</script>` (a dish description a user typed, for
 * instance) would terminate the script tag early and inject whatever
 * follows as live markup. Every caller here passes data that ultimately
 * traces back to AI output or a user's own text field, so this is not a
 * hypothetical.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
