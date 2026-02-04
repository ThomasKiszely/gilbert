export interface Product {
    id: string,
    title: string,
    brand: string,
    price: number,
    imageUrl: string,
    tag?: string,
    isFavorite?: boolean,
}

export interface ApiProduct {
    id: string;
    title: string;
    brand?: { name: string };
    price: number;
    images?: string[];
    tags?: { name: string }[];
    isFavorite?: boolean;
}



