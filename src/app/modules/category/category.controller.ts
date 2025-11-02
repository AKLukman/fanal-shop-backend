import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from 'http-status';
import { CategoryServices } from "./category.services";
import { categoryFilterableFields } from "./category.constant";
import pick from "../../../shared/pick";

const insertIntoDB = catchAsync( async ( req: Request, res: Response ) => {

    const result = await CategoryServices.insertIntoDB( req.body )

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category created successfully!",
        data: result

    } )
} )

const getAllFromDB = catchAsync( async ( req: Request, res: Response ) => {
    const filters = pick( req.query, categoryFilterableFields );
    const options = pick( req.query, [ 'limit', 'page', 'sortBy', 'sortOrder' ] );
    const result = await CategoryServices.getAllFromDB( filters, options );
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Categories retrived successfully!",
        data: result
    } )

} )

const updateFromDB = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params;
    const result = await CategoryServices.updateFromDB( id, req.body )


    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category updated successfully!",
        data: result
    } )
} )
const getById = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params;
    const result = await CategoryServices.getById( id )


    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category get successfully!",
        data: result
    } )
} )

export const CategoryControllers = {
    insertIntoDB,
    getAllFromDB,
    updateFromDB,
    getById
}