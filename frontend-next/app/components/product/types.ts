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





