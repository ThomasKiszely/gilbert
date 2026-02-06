import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/UI/button";
interface BlogPostProps {
    title: string;
    subtitle: string;
    imageUrl: string;
    link?: string;
}

const BlogPost = ({ title, subtitle, imageUrl, link = "/search" }: BlogPostProps) => {
    return (
        <section className="w-full">
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
                    <span className="text-xs uppercase tracking-widest text-foreground/70 mb-2">
                        This Week's Selection
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-2">
                        {title}
                    </h2>

                    <p className="text-foreground/80 mb-4 max-w-md">
                        {subtitle}
                    </p>

                    <Link href={link}>
                        <Button
                            variant="outline"
                            className="w-fit border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                            Shop Now
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BlogPost;