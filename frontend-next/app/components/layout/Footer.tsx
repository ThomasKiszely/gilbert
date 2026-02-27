import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-card border-t border-border/30 text-foreground/80 pb-24">
            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Top - Logo */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif font-bold tracking-widest text-foreground">GILBERT</h2>
                    <p className="text-sm text-muted-foreground mt-1">Luxury pre-owned fashion</p>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                    {/* Kundeservice */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Kundeservice</h3>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="hover:text-foreground transition-colors">Hjælp & FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Kontakt os</Link></li>
                            <li><Link href="/shipping" className="hover:text-foreground transition-colors">Levering & Fragt</Link></li>
                            <li><Link href="/returns" className="hover:text-foreground transition-colors">Returpolitik</Link></li>
                        </ul>
                    </div>

                    {/* Om Gilbert */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Om Gilbert</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">Om os</Link></li>
                            <li><Link href="/sustainability" className="hover:text-foreground transition-colors">Bæredygtighed</Link></li>
                            <li><Link href="/careers" className="hover:text-foreground transition-colors">Karriere</Link></li>
                            <li><Link href="/press" className="hover:text-foreground transition-colors">Presse</Link></li>
                        </ul>
                    </div>

                    {/* Juridisk */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Juridisk</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privatlivspolitik</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors">Handelsbetingelser</Link></li>
                            <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookiepolitik</Link></li>
                            <li><Link href="/gdpr" className="hover:text-foreground transition-colors">GDPR</Link></li>
                        </ul>
                    </div>

                    {/* Følg os */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Følg os</h3>
                        <ul className="space-y-2">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Facebook</a></li>
                            <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">TikTok</a></li>
                            <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Pinterest</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-border/30 text-xs text-muted-foreground text-center space-y-2">
                    <p>© {new Date().getFullYear()} Gilbert ApS · CVR: 12345678 · Alle rettigheder forbeholdes</p>
                    <p>Gilbert ApS · Bredgade 25 · 1260 København K · Danmark</p>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>MobilePay</span>
                        <span>Apple Pay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
