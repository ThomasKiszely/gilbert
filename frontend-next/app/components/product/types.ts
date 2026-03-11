export interface Product {
    id: string;
    title: string;
    brand: string;
    price: number;
    imageUrl: string;
    tag?: string;
    isFavorite: boolean;
    seller?: {
        username?: string;
        rating?: number;
    };
}

export interface ApiProduct {
    _id: string;
    id?: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    brand?: { _id: string; name: string };
    category?: { _id: string; name: string };
    subcategory?: { _id: string; name: string };
    size?: { label?: string; name?: string } | string;
    condition?: { name?: string } | string;
    color?: { name?: string } | string;
    material?: { name?: string } | string;
    images?: string[];
    tags?: { name: string }[];
    isFavorite?: boolean;
    status: string;
    seller?: {
        _id: string;
        username?: string;
        profile?: { avatarUrl?: string };
        stats?: { ratingAverage?: number; numberOfSales?: number };
        rating?: number;
        sales?: number;
    };
}
