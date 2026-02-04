import { api } from "./api";

export async function toggleFavorite(productId: string) {
    const res = await api(`/api/favorites/${productId}`, {
        method: "PATCH"
    });

    const data = await res.json();
    return data.success;
}
