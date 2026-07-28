import type { LegalDocument as LegalDocumentContent } from "@/content/legal";

function Paragraph({ text }: { text: string }) {
  if (text.startsWith("- ")) {
    return <li className="text-body text-foreground-secondary">{text.slice(2)}</li>;
  }
  return <p className="text-body text-foreground-secondary">{text}</p>;
}

/**
 * Groups consecutive "- " paragraphs into a single <ul> so a section can mix
 * intro sentences and bullet points (every /privacy and /terms section does)
 * without each content file having to encode that structure itself.
 */
function SectionBody({ paragraphs }: { paragraphs: string[] }) {
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="flex list-disc flex-col gap-2 ps-5">
        {listBuffer.map((item) => (
          <Paragraph key={item} text={`- ${item}`} />
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  paragraphs.forEach((paragraph, index) => {
    if (paragraph.startsWith("- ")) {
      listBuffer.push(paragraph.slice(2));
    } else {
      flushList(`list-${index}`);
      nodes.push(<Paragraph key={paragraph} text={paragraph} />);
    }
  });
  flushList("list-end");

  return <>{nodes}</>;
}

export function LegalDocument({ document }: { document: LegalDocumentContent }) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-h3 text-foreground font-semibold">{document.title}</h1>
        <div className="flex flex-col gap-2">
          <SectionBody paragraphs={document.intro} />
        </div>
      </header>
      {document.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-h6 text-foreground font-semibold">{section.heading}</h2>
          <div className="flex flex-col gap-2">
            <SectionBody paragraphs={section.paragraphs} />
          </div>
        </section>
      ))}
    </article>
  );
}
