import { Category, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma"
import { ICategory, ICategoryFilterRequest } from "./category.interface";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/pagination";

const insertIntoDB = async ( data: ICategory ): Promise<Category> => {

    const result = await prisma.category.create( { data } );
    return result

}

const getAllFromDB = async ( filters: ICategoryFilterRequest,
    options: IPaginationOptions, ) => {
    const { limit, page, skip } = paginationHelpers.calculatePagination( options );
    const { searchTerm, ...filterData } = filters;
    const andConditions: Prisma.CategoryWhereInput[] = [];

    if ( searchTerm ) {
        andConditions.push( {
            OR: [
                {
                    name: { contains: searchTerm, mode: 'insensitive' },
                },
            ]
        } );

    }

    const whereConditions: Prisma.CategoryWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.category.findMany( {
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [ options.sortBy ]: options.sortOrder }
                : { createdAt: 'desc' }
    } );

    const total = await prisma.category.count( {
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

}

const getById = async ( id: string ) => {
    const result = await prisma.category.findUniqueOrThrow( { where: { id } } )
    return result
}

const updateFromDB = async ( categoryId: string, categoryData: ICategory ) => {
    const result = await prisma.category.update( {
        where: {
            id: categoryId
        },
        data: categoryData
    } )
    return result
}

export const CategoryServices = {
    insertIntoDB,
    getAllFromDB,
    updateFromDB,
    getById
}