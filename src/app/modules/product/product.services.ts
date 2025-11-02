import { Request } from "express";
import { IUploadFile } from "../../../interfaces/file";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { FileUploadHelper } from "../../../helpers/fileUploadHelper";
import prisma from "../../../shared/prisma";
import { IProductFilterRequest } from "./product.interface";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IGenericResponse } from "../../../interfaces/common";
import { Prisma, Product } from "@prisma/client";
import { paginationHelpers } from "../../../helpers/paginationHelper";



export const insertIntoDB = async ( req: Request ) => {
    const files = req.files as IUploadFile[];

    if ( !files || files.length === 0 ) {
        throw new ApiError( httpStatus.BAD_REQUEST, 'At least one image is required' );
    }

    // Upload all images to Cloudinary
    const uploadedImages = await Promise.all(
        files.map( async ( file ) => {
            const result = await FileUploadHelper.uploadToCloudinary( file );
            if ( !result?.secure_url ) {
                throw new ApiError( httpStatus.INTERNAL_SERVER_ERROR, 'Image upload failed' );
            }
            return result?.secure_url;
        } )
    );

    // Step 1: Create product and images in transaction
    const productId = await prisma.$transaction( async ( tx ) => {
        const product = await tx.product.create( {
            data: {
                ...req.body,
            },
        } );

        await tx.image.createMany( {
            data: uploadedImages.map( ( url ) => ( {
                url,
                productId: product.id,
            } ) ),
        } );

        return product.id;
    } );

    // Step 2: Return full product with images and category
    const fullProduct = await prisma.product.findUnique( {
        where: { id: productId },
        include: {
            images: true,
            category: true,
        },
    } );

    return fullProduct;
};


export const getAllFromDB = async (
    filters: IProductFilterRequest,
    options: IPaginationOptions,
): Promise<IGenericResponse<Product[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination( options );
    const { searchTerm, minPrice, maxPrice, isFeatured, ...filterData } = filters;
    const andConditions: Prisma.ProductWhereInput[] = [];



    if ( searchTerm ) {
        andConditions.push( {
            OR: [
                {
                    name: { contains: searchTerm, mode: 'insensitive' },
                },
                {
                    description: { contains: searchTerm, mode: 'insensitive' },
                },
                {
                    category: {
                        name: { contains: searchTerm, mode: 'insensitive' },
                    },
                }, ]
        } );
    }

    // Price Filter
    if ( minPrice !== undefined || maxPrice !== undefined ) {
        andConditions.push( {
            price: {
                gte: Number( minPrice ) ?? 0,
                lte: Number( maxPrice ) ?? Number.MAX_SAFE_INTEGER,
            },
        } );
    }
    // Featured
    if ( isFeatured === true || isFeatured !== undefined ) {
        andConditions.push( { isFeatured: true } );
    }

    if ( Object.keys( filterData ).length > 0 ) {
        const filterConditions = Object.entries( filterData ).map( ( [ key, value ] ) => ( {
            [ key ]: { equals: value },
        } ) );
        andConditions.push( ...filterConditions );
    }

    const whereConditions: Prisma.ProductWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.product.findMany( {
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [ options.sortBy ]: options.sortOrder }
                : { createdAt: 'desc' },
        include: {
            category: true,
            images: true,
            reviews: true,
        },
    } );

    const total = await prisma.product.count( {
        where: whereConditions,
    } );

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

const getById = async ( id: string ) => {
    const result = await prisma.product.findUniqueOrThrow( {
        where: {
            id
        },
        include: {
            images: true,
            category: true,
            reviews: {
                include: {
                    customer: true
                }
            }
        }
    } )
    return result
}



export const updateById = async ( req: Request ) => {
    const { id } = req.params;
    const files = req.files as IUploadFile[];


    // ---- Parse FormData JSON safely ----
    let rawPayload: any = {};
    try {
        rawPayload = req.body.data ? JSON.parse( req.body.data ) : req.body;
    } catch ( err ) {
        throw new ApiError( httpStatus.BAD_REQUEST, "Invalid JSON payload" );
    }

    const payload = rawPayload || {};

    // ---- Ensure product exists ----
    const existsProduct = await prisma.product.findFirst( {
        where: { id },
        include: { images: true },
    } );

    if ( !existsProduct ) {
        throw new ApiError( httpStatus.NOT_FOUND, "Product not found" );
    }

    // ---- Normalize existingImages ----
    let existingImages: string[] = [];

    if ( Array.isArray( payload.existingImages ) ) {
        existingImages = payload.existingImages;
    } else if ( typeof payload.existingImages === "string" ) {
        try {
            const parsed = JSON.parse( payload.existingImages );
            existingImages = Array.isArray( parsed ) ? parsed : [ payload.existingImages ];
        } catch {
            existingImages = [ payload.existingImages ];
        }
    }

    // ---- Upload new files ----
    let uploadedImages: string[] = [];
    if ( files && files.length > 0 ) {
        uploadedImages = await Promise.all(
            files.map( async ( file ) => {
                const result = await FileUploadHelper.uploadToCloudinary( file );
                if ( !result?.secure_url ) {
                    throw new ApiError(
                        httpStatus.INTERNAL_SERVER_ERROR,
                        "Image upload failed"
                    );
                }
                return result.secure_url;
            } )
        );
    }

    // ---- Transaction: delete removed, add new, update product ----
    const result = await prisma.$transaction( async ( tx ) => {
        // 1. Delete only removed images
        const toDelete = existsProduct.images.filter(
            ( img ) => !existingImages.includes( img.url )
        );

        if ( toDelete.length > 0 ) {
            await tx.image.deleteMany( {
                where: { id: { in: toDelete.map( ( img ) => img.id ) } },
            } );
        }

        // 2. Insert only new ones
        if ( uploadedImages.length > 0 ) {
            await tx.image.createMany( {
                data: uploadedImages.map( ( url ) => ( {
                    url,
                    productId: existsProduct.id,
                } ) ),
            } );
        }

        // 3. Update product fields (safe guards against NaN/undefined)
        return tx.product.update( {
            where: { id },
            data: {
                name: payload.name ?? existsProduct.name,
                price:
                    payload.price !== undefined && !isNaN( Number( payload.price ) )
                        ? Number( payload.price )
                        : existsProduct.price,
                offerPrice:
                    payload.offerPrice !== undefined && !isNaN( Number( payload.offerPrice ) )
                        ? Number( payload.offerPrice )
                        : existsProduct.offerPrice,
                description: payload.description ?? existsProduct.description,
                stock:
                    payload.stock !== undefined && !isNaN( Number( payload.stock ) )
                        ? Number( payload.stock )
                        : existsProduct.stock,
                status: payload.status ?? existsProduct.status,
                categoryId: payload.categoryId ?? existsProduct.categoryId,
            },
            include: { images: true }, // return updated product with images
        } );
    } );

    return result;
};





const deleteById = async ( id: string ) => {
    const isProductExist = await prisma.product.findUnique( {
        where: {
            id
        },
        include: {
            images: true,
            reviews: true
        }
    } )
    if ( !isProductExist ) {
        throw new ApiError( httpStatus.NOT_FOUND, "Product not found" );
    }
    const imageIds = isProductExist.images.map( image => image.id )
    const reviewIds = isProductExist.reviews.map( reviw => reviw.id )
    const result = await prisma.$transaction( async ( tx ) => {

        await tx.image.deleteMany( {
            where: {
                id: { in: imageIds },
                productId: isProductExist.id

            }
        } )
        await tx.review.deleteMany( {
            where: {
                id: { in: reviewIds },
                productId: isProductExist.id
            }
        } )
        const product = await tx.product.delete( {
            where: { id }
        } )

        return product
    } )
    return result
}

export const ProductServices = {
    insertIntoDB,
    getAllFromDB,
    getById,
    updateById,
    deleteById
}