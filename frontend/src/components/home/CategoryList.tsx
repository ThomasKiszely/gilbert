interface Category {
    id: string;
    name: string;
    imageUrl: string;
    link: string;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
    return (
        <section className="py-8">
            <h2 className="text-xl font-semibold mb-4 px-4">Browse Categories</h2>

            <div className="flex justify-between px-4">
                {categories.map((cat) => (
                    <a key={cat.id} href={cat.link} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {cat.imageUrl ? (
                                <img src={cat.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm opacity-60">{cat.name[0]}</span>
                            )}
                        </div>
                        <span className="text-sm mt-2">{cat.name}</span>
                    </a>
                ))}
            </div>
        </section>
    );
};


export default CategoryList;
