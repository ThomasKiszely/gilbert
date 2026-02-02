interface BlogPostProps {
    title: string;
    subtitle: string;
    imageUrl: string;
}

const BlogPost = ({ title, subtitle, imageUrl }: BlogPostProps) => {
    return (
        <section className="relative w-full h-[380px] overflow-hidden rounded-xl mt-4">
            <img
                src={imageUrl}
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 flex flex-col justify-center h-full px-6">
                <p className="text-xs uppercase tracking-widest text-white/80">
                    THIS WEEK'S SELECTION
                </p>

                <h1 className="text-3xl font-semibold mt-1">{title}</h1>

                <p className="max-w-sm mt-3 text-sm text-white/90">{subtitle}</p>

                <a
                    href="#products"
                    className="mt-4 inline-block bg-white text-black px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Shop Now
                </a>
            </div>
        </section>

    );
};

export default BlogPost;
