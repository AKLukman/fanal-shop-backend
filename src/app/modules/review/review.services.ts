import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IAuthUser, IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma, Review } from '@prisma/client';
import { reviewRelationalFields, reviewRelationalFieldsMapper } from './review.constants';



const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions,
): Promise<IGenericResponse<Review[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination( options );
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if ( Object.keys( filterData ).length > 0 ) {
    andConditions.push( {
      AND: Object.keys( filterData ).map( key => {
        if ( reviewRelationalFields.includes( key ) ) {
          return {
            [ reviewRelationalFieldsMapper[ key ] ]: {
              email: ( filterData as any )[ key ],
            },
          };
        } else {
          return {
            [ key ]: {
              equals: ( filterData as any )[ key ],
            },
          };
        }
      } ),
    } );
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany( {
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [ options.sortBy ]: options.sortOrder }
        : {
          createdAt: 'desc',
        },
    include: {
      customer: true,

    },
  } );
  const total = await prisma.review.count( {
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

const insertIntoDB = async ( data: Review, user: IAuthUser ): Promise<Review> => {
  console.log( data )


  const isUserExist = await prisma.customer.findFirst( {
    where: {
      email: user?.email,
      id: data.customerId
    }
  } )
  if ( !isUserExist ) {
    throw new ApiError( httpStatus.NOT_FOUND, "This user doesn't exist" )
  }
  const isProductExist = await prisma.product.findFirst( {
    where: {
      id: data.productId
    }
  } )

  if ( !isProductExist ) {
    throw new ApiError( httpStatus.NOT_FOUND, "Product not found" );
  }
  const newReview = await prisma.review.create( {
    data: {
      customerId: isUserExist.id,
      productId: isProductExist.id,
      rating: data.rating,
      comment: data.comment,
    },
  } );

  return newReview;

}
export const ReviewService = {
  insertIntoDB,
  getAllFromDB,
};
