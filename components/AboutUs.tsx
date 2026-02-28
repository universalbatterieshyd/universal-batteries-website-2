type AboutUsProps = {
  config?: {
    blocks?: {
      headline?: string;
      subheadline?: string;
      story?: string;
      imageUrl?: string;
      imageCaption?: string;
    }[];
  } | null;
};

export default function AboutUs({ config }: AboutUsProps) {
  const blocks = config?.blocks ?? [];

  if (blocks.length === 0) return null;

  return (
    <section className="py-20 bg-background" id="about-story">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          {blocks.map((block, index) => (
            <div
              key={index}
              className={`flex flex-col gap-8 ${block.imageUrl ? "md:flex-row md:items-center" : ""} ${index % 2 === 1 && block.imageUrl ? "md:flex-row-reverse" : ""}`}
            >
              {(block.headline || block.subheadline || block.story) && (
                <div className="flex-1">
                  {block.headline && (
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                      {block.headline}
                    </h2>
                  )}
                  {block.subheadline && (
                    <p className="text-lg text-primary font-medium mb-4">{block.subheadline}</p>
                  )}
                  {block.story && (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                      {block.story}
                    </div>
                  )}
                </div>
              )}
              {block.imageUrl && (
                <div className={`flex-1 ${!(block.headline || block.story) ? "md:col-span-full" : ""}`}>
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.imageUrl}
                      alt={block.imageCaption || block.headline || "About Universal Batteries"}
                      className="rounded-2xl w-full object-cover shadow-lg"
                    />
                    {block.imageCaption && (
                      <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                        {block.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
