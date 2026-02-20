import Link from "next/link";

interface BlogPostProps {
    title: string;
    subtitle: React.ReactNode;
    imageUrl: string;
    slug?: string; // Valgfri, så vi ikke ødelægger noget
}

const BlogPost = ({ title, subtitle, imageUrl, slug }: BlogPostProps) => {
    return (
        <section className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden bg-slate-200">
            {/* Baggrundsbillede med mørkere overlay direkte på billedet */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover grayscale brightness-75"
            />

            {/* Tekstindhold */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6">
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-[0.8] max-w-4xl">
                    {title}
                </h2>

                {/* Her begrænser vi højden på din teaser så den ikke fylder det hele */}
                <div className="max-w-xl text-sm md:text-base font-light opacity-90 line-clamp-3 mb-8">
                    {subtitle}
                </div>

                {slug ? (
                    <Link
                        href={`/blog/${slug}`}
                        className="border border-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                    >
                        Read Story
                    </Link>
                ) : (
                    <button className="border border-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                        Explore Collection
                    </button>
                )}
            </div>
        </section>
    );
};

export default BlogPost;