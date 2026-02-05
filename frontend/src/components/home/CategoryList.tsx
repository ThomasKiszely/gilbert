interface Category {
    id: string;
    name: string;
    imageUrl: string;
    link: string;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
    return (
        <section className="py-10">
            <h2 className="text-xl font-semibold mb-6 px-4">Browse Categories</h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 px-4 place-items-center">
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href={cat.link}
                        className="flex flex-col items-center group"
                    >
                        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                            {cat.imageUrl ? (
                                <img
                                    src={cat.imageUrl}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-lg opacity-60">{cat.name[0]}</span>
                            )}
                        </div>

                        <span className="text-sm mt-3 text-foreground/80 group-hover:text-foreground transition">
          {cat.name}
        </span>
                    </a>
                ))}
            </div>
        </section>

    );
};


export default CategoryList;
