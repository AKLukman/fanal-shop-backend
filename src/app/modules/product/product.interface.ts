export type IProductFilterRequest = {
    searchTerm?: string;
    categoryId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isFeatured?: boolean;
    minPrice?: string;
    maxPrice?: string;
}