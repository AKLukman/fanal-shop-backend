import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ProductServices } from "./product.services";
import pick from "../../../shared/pick";
import { productFilterableFields } from "./product.constant";

const insertIntoDB = catchAsync( async ( req: Request, res: Response ) => {
    const result = await ProductServices.insertIntoDB( req )

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product created successfully!",
        data: result
    } )
} )

const getAllFromDB = catchAsync( async ( req: Request, res: Response ) => {


    const filters = pick( req.query, productFilterableFields );
    const options = pick( req.query, [ 'limit', 'page', 'sortBy', 'sortOrder' ] );
    const result = await ProductServices.getAllFromDB( filters, options )
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All product retrived successfully!",
        data: result
    } )
} )

const getById = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params
    const result = await ProductServices.getById( id )

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product retrived successfully",
        data: result
    } )
} )
const updateById = catchAsync( async ( req: Request, res: Response ) => {
    const result = await ProductServices.updateById( req )

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product updated successfully",
        data: result
    } )
} )

const deleteById = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params

    const result = await ProductServices.deleteById( id )

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product deleted successfully!",
        data: result

    } )
} )
export const ProductControllers = {
    insertIntoDB,
    getAllFromDB,
    getById,
    updateById,
    deleteById
}