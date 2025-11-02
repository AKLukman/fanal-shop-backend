import { z, ZodArray } from "zod";

const createProduct = z.object( {
    name: z.string().min( 1, 'Product name is required' ),
    description: z.string().optional(),
    price: z.number().positive( 'Price must be a positive number' ),
    offerPrice: z.number().optional(),
    stock: z.number().int().nonnegative( 'Stock must be 0 or greater' ),
    colors: z.array( z.string() ).nonempty( "At least one color" ),
    sizes: z.array( z.string() ).nonempty( "At least one size" ),
    status: z.enum( [ 'ACTIVE', 'INACTIVE' ] ),
    deliverFeeInsideDhaka: z.number().positive( 'Deliver fee must be a positive number' ).optional(),
    deliverFeeOutsideDhaka: z.number().positive( 'Deliver fee must be a positive number' ).optional(),
    categoryId: z.string().uuid( 'Invalid category ID' ),
    isFeatured: z.boolean().optional(),
} );

export const productStatusEnum = z.enum( [ "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED" ] );

export const updateProductSchema = z.object( {
    name: z.string().min( 1 ).optional(),
    description: z.string().min( 1 ).optional(),
    price: z.number().nonnegative().optional(),
    offerPrice: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    status: productStatusEnum.optional(),
    categoryId: z.string().uuid( 'Invalid category ID' ).optional(),
    deliverFeeInsideDhaka: z.number().optional(),
    deliverFeeOutsideDhaka: z.number().optional(),
    isFeatured: z.boolean().optional(),
    existingImages: z.array( z.string().url() ).optional(),
} );

export const ProductValidations = {
    createProduct,
    updateProductSchema
}