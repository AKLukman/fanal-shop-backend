import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";
import { sslServices } from "../ssl/ssl.service"
import { OrderStatus, PaymentStatus } from "@prisma/client";


const initPayment = async ( orderId: string ) => {

    const paymentData = await prisma.payment.findFirst( {
        where: {
            orderId
        },
        include: {
            order: true
        }
    } );

    if ( !paymentData ) {
        throw new ApiError( httpStatus.BAD_REQUEST, "Payment information not found!" )
    }
    if ( paymentData.status === PaymentStatus.PAID ) {
        throw new ApiError( httpStatus.BAD_REQUEST, "You already paid for the order!" )
    }

    const paymentSession = await sslServices.initPayment( {
        amount: paymentData.amount,
        transactionId: `TNI-${ Date.now() }-${ Math.floor( Math.random() * 1000 ) }`,
        customerName: paymentData.order.customerName,
        customerEmail: paymentData.order.customerEmail
    } )
    return {
        paymentUrl: paymentSession.GatewayPageURL,
    };
};

const validate = async ( payload: any ) => {
    // if (!payload || !payload?.status || payload?.status !== 'VALID') {
    //     return {
    //         massage: 'Invalid Payment!'
    //     }
    // }
    // const result = await sslServices.validate(payload);

    // if (result?.status !== 'VALID') {
    //     return {
    //         massage: 'Payment failed'
    //     }
    // }
    // const { tran_id } = result;

    // Uncomment when validate in locally

    const { tran_id, status } = payload;

    if ( !tran_id ) {
        return { message: "Invalid Payment Payload" };
    }

    if ( status !== "VALID" ) {
        // Payment failed or cancelled → delete or mark order as cancelled
        const paymentData = await prisma.payment.findUnique( {
            where: { transactionId: tran_id },
        } );

        if ( paymentData ) {
            await prisma.$transaction( async ( tx ) => {
                // Option 1: Hard delete
                await tx.payment.delete( { where: { id: paymentData.id } } );
                await tx.order.delete( { where: { id: paymentData.orderId } } );

                // ---- OR ----
                // Option 2: Soft cancel
                // await tx.payment.update({
                //   where: { id: paymentData.id },
                //   data: { status: PaymentStatus.FAILED, paymentGatewayData: payload },
                // });
                // await tx.order.update({
                //   where: { id: paymentData.orderId },
                //   data: { orderStatus: OrderStatus.CANCELLED },
                // });
            } );
        }

        return { message: "Payment failed or cancelled, order removed" };
    }

    await prisma.$transaction( async ( transactionClient ) => {
        const paymentData = await transactionClient.payment.update( {
            where: {
                transactionId: tran_id
            },
            data: {
                status: PaymentStatus.PAID,
                paymentGatewayData: payload
            }
        } );

        await transactionClient.order.update( {
            where: {
                id: paymentData.orderId
            },
            data: {
                orderStatus: OrderStatus.CONFIRMED
            }
        } )
    } );

    return {
        massage: 'Payment Success'
    };
}

export const PaymentService = {
    initPayment,
    validate
}