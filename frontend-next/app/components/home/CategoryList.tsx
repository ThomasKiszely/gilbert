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
            <div className="px-6 sm:px-10 lg:px-16 w-full">
                <h2 className="text-2xl font-serif font-bold mb-10 text-ivory tracking-tight">
                    Browse Categories
                </h2>

                <div className="flex flex-row items-start gap-8 sm:gap-14 md:gap-20 overflow-x-auto md:overflow-visible justify-start md:justify-between w-full pb-4 no-scrollbar">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={cat.link}
                            className="flex flex-col items-center group shrink-0"
                        >
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-ivory-dark overflow-hidden flex items-center justify-center shadow-xl border-2 border-ivory/10 group-hover:border-ivory/40 transition-all">
                                {cat.imageUrl ? (
                                    <img
                                        src={cat.imageUrl}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <span className="text-2xl font-serif font-bold text-racing-green">
                                        {cat.name[0]}
                                    </span>
                                )}
                            </div>

                            <span className="text-[10px] sm:text-xs mt-4 text-ivory font-bold uppercase tracking-[0.2em] text-center">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryList;
