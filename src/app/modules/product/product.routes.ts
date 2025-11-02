import { NextFunction, Request, Response, Router } from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { ProductControllers } from "./product.controllers";
import { FileUploadHelper } from "../../../helpers/fileUploadHelper";
import { ProductValidations } from "./product.validation";


const router = Router();

router.post( "/",
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    FileUploadHelper.upload.array( 'files' ),
    ( req: Request, res: Response, next: NextFunction ) => {
        req.body = ProductValidations.createProduct.parse( JSON.parse( req.body.data ) );
        return ProductControllers.insertIntoDB( req, res, next );
    },
)

router.get( "/", ProductControllers.getAllFromDB )
router.get( '/:id', ProductControllers.getById )
router.patch( "/:id",
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    FileUploadHelper.upload.array( 'files' ),
    ( req: Request, res: Response, next: NextFunction ) => {
        req.body = ProductValidations.updateProductSchema.parse( JSON.parse( req.body.data ) );
        return ProductControllers.updateById( req, res, next );
    },
)

router.delete( "/:id",
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    ProductControllers.deleteById
)
export const ProductRoutes = router;