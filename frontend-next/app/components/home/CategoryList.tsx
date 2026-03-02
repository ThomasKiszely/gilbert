import Link from "next/link";

interface Category {
    id: string;
    name: string;
    imageUrl: string;
    link: string;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
    return (
        <section className="py-12 w-full">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground tracking-tight">
                Shop by Category
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.link}
                        className="group text-center"
                    >
                        <div className="aspect-square rounded-lg bg-card border border-border/30 overflow-hidden mb-3 flex items-center justify-center p-4">
                            {cat.imageUrl ? (
                                <img
                                    src={cat.imageUrl}
                                    alt={cat.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <span className="text-3xl md:text-4xl font-serif font-bold text-foreground/40 group-hover:text-foreground/60 transition-colors">
                                    {cat.name[0]}
                                </span>
                            )}
                        </div>
                        <span className="text-xs md:text-sm uppercase tracking-wider font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategoryList;
