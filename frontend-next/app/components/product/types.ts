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
    brand?: { name: string };
    price: number;
    images?: string[];
    tags?: { name: string }[];
    isFavorite?: boolean;
    status: string;
}
