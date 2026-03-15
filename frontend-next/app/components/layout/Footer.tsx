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
                    {/* Customer Service */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="hover:text-foreground transition-colors">Help & FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact us</Link></li>
                            <li><Link href="/shipping" className="hover:text-foreground transition-colors">Delivery & Shipping</Link></li>
                            <li><Link href="/returns" className="hover:text-foreground transition-colors">Return Policy</Link></li>
                        </ul>
                    </div>

                    {/* About Gilbert */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">About Gilbert</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">About us</Link></li>
                            <li><Link href="/sustainability" className="hover:text-foreground transition-colors">Sustainability</Link></li>
                            <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                            <li><Link href="/press" className="hover:text-foreground transition-colors">Press</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                            <li><Link href="/gdpr" className="hover:text-foreground transition-colors">GDPR</Link></li>
                        </ul>
                    </div>

                    {/* Follow us */}
                    <div>
                        <h3 className="font-serif text-foreground font-semibold mb-3 text-base">Follow us</h3>
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
                    <p>© {new Date().getFullYear()} Gilbert ApS · CVR: 12345678 · All rights reserved</p>
                    <p>Gilbert ApS · Bredgade 25 · 1260 Copenhagen K · Denmark</p>
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
