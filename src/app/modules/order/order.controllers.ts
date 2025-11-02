import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { OrderServices } from "./order.services";
import pick from "../../../shared/pick";
import { orderFilterableFields } from "./order.constant";

const insertIntoDB = catchAsync( async ( req: Request, res: Response ) => {

    const result = await OrderServices.insertIntoDB( req.body );
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order created successfully',
        data: result,
    } );
} )
const getOrdersFromDB = catchAsync( async ( req: Request, res: Response ) => {
    const filters = pick( req.query, orderFilterableFields );
    const options = pick( req.query, [ 'limit', 'page', 'sortBy', 'sortOrder' ] );

    const result = await OrderServices.getOrdersFromDB( filters, options );
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All orders retrived successfully',
        data: result,
    } );
} )
const getOrderById = catchAsync( async ( req: Request, res: Response ) => {
    const id = req.params.id;
    const result = await OrderServices.getOrderById( id );
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'order retrived successfully',
        data: result,
    } );
} )
const getCustomerOrders = catchAsync( async ( req: Request, res: Response ) => {
    const user = req.user

    const result = await OrderServices.getCustomerOrders( user );
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'order retrived successfully',
        data: result,
    } );
} )

const updateFromDB = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params;
    const result = await OrderServices.updateFromDB( id, req.body )
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order updated successfully!",
        data: result
    } )
} )
const deleteFromDB = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params;
    const result = await OrderServices.deleteFromDB( id )
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order deleted successfully!",
        data: result
    } )
} )

export const OrderControllers = {
    insertIntoDB,
    getOrdersFromDB,
    getOrderById,
    getCustomerOrders,
    updateFromDB,
    deleteFromDB
}