import { Order, OrderStatus, PaymentMode, PaymentStatus, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { IOrder, IOrderFilterRequest } from "./order.interface";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";

const insertIntoDB = async ( data: any ) => {
    let upfrontAmount = 0;
    if ( data.paymentMode === PaymentMode.FULL_PAYMENT ) {
        upfrontAmount = data.totalAmount;
    } else if ( data.paymentMode === PaymentMode.DELIVERY_ONLY ) {
        upfrontAmount = data.deliveryCharge;
    }

    return prisma.$transaction( async ( tx ) => {
        // 1️⃣ Create the order
        const order = await tx.order.create( {
            data: {
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerId: data.customerId || null,
                deliveryCharge: data.deliveryCharge,
                paymentMode: data.paymentMode,
                totalAmount: data.totalAmount,
                shippingInfo: data.shippingInfo,
                items: {
                    create: data.items.map( ( i: { productId: any; quantity: any; price: any; name: any; image: any; color: any; sizes: any; } ) => ( {
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                        name: i.name,
                        image: i.image,
                        color: i.color,
                        sizes: Array.isArray( i.sizes ) ? i.sizes : [ i.sizes ],
                    } ) ),
                },
                payment:
                    data.paymentMode === PaymentMode.COD
                        ? undefined
                        : {
                            create: {
                                amount: upfrontAmount,
                                status: PaymentStatus.UNPAID,
                            },
                        },
            },
            include: {
                payment: true,
                items: { include: { product: true } },
            },
        } );

        // Example: update stock of each product
        for ( const item of data.items ) {
            await tx.product.update( {
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            } );
        }

        // Return the full order
        return order;
    } );
};

const getOrdersFromDB = async ( filters: IOrderFilterRequest,
    options: IPaginationOptions ): Promise<IGenericResponse<Order[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination( options );
    const { searchTerm, orderStatus, ...filterData } = filters;
    const andConditions: Prisma.OrderWhereInput[] = [];

    if ( searchTerm ) {
        andConditions.push( {
            OR: [
                {
                    customerName: { contains: searchTerm, mode: 'insensitive' },
                },
                {
                    customerEmail: { contains: searchTerm, mode: 'insensitive' },
                },
            ]
        } );
    }

    if ( orderStatus && orderStatus !== undefined ) {
        andConditions.push( {
            orderStatus: {
                equals: orderStatus as OrderStatus,
            },
        } );
    }

    if ( Object.keys( filterData ).length > 0 ) {
        const filterConditions = Object.entries( filterData ).map( ( [ key, value ] ) => ( {
            [ key ]: { equals: value },
        } ) );
        andConditions.push( ...filterConditions );
    }

    const whereConditions: Prisma.OrderWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.order.findMany( {
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [ options.sortBy ]: options.sortOrder }
                : { createdAt: 'desc' },
        include: {

        },
    } );

    const total = await prisma.order.count( {
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

const getOrderById = async ( id: string ) => {
    const res = await prisma.order.findFirst( {
        where: {
            id
        },
        include: {
            payment: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    } )
    return res;
}

const getCustomerOrders = async ( user: any ) => {
    const userData = await prisma.user.findUnique( {
        where: {
            email: user.email
        }
    } )

    if ( !userData ) {

        throw new ApiError( httpStatus.UNAUTHORIZED, 'User does not exists!' );

    }
    const result = await prisma.order.findMany( {
        where: { customerEmail: userData.email },
        include: {
            payment: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    } )
    return result
}

const updateFromDB = async ( orderId: string, orderData: IOrder ) => {
    const result = await prisma.order.update( {
        where: {
            id: orderId
        },
        data: orderData
    } )
    return result
}
const deleteFromDB = async ( orderId: string ) => {

    const result = await prisma.$transaction( async ( tx ) => {

        await tx.orderItem.deleteMany( {
            where: { orderId }
        } )
        const deleteOrder = await tx.order.delete( {
            where: {
                id: orderId
            },

        } )

        return deleteOrder
    } )

    return result
}


export const OrderServices = { insertIntoDB, getOrdersFromDB, getOrderById, getCustomerOrders, updateFromDB, deleteFromDB }