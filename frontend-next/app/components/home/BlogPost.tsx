import Link from "next/link";

interface BlogPostProps {
    title: string;
    subtitle: React.ReactNode;
    imageUrl: string;
    slug?: string; // Valgfri, så vi ikke ødelægger noget
}

const BlogPost = ({ title, subtitle, imageUrl, slug }: BlogPostProps) => {
    return (
        <section className="pt-4">
            <div className="relative h-[45vh] min-h-[300px] max-h-[450px] w-full overflow-hidden bg-slate-200">
                {/* Baggrundsbillede med mørkere overlay */}
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src={imageUrl}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover grayscale brightness-75"
                />

                {/* Tekstindhold */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-3 leading-[0.85] max-w-2xl">
                        {title}
                    </h2>

                    <div className="max-w-sm text-xs md:text-sm font-light opacity-90 line-clamp-2 mb-5">
                        {subtitle}
                    </div>

                    {slug ? (
                        <Link
                            href={`/blog/${slug}`}
                            className="border border-white px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                        >
                            Read Story
                        </Link>
                    ) : (
                        <button className="border border-white px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                            Explore Collection
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BlogPost;