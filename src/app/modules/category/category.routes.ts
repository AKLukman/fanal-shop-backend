import { Router } from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { CategoryControllers } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryZodValidations } from "./category.validations";


const router = Router();

router.post( "/",
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    validateRequest( CategoryZodValidations.create ),
    CategoryControllers.insertIntoDB

)
router.get( '/',
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN ),
    CategoryControllers.getAllFromDB

)
router.patch( '/:id',
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN ),
    validateRequest( CategoryZodValidations.update ),
    CategoryControllers.updateFromDB

)

router.get( "/:id",
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN ),
    CategoryControllers.getById
)

export const CategoryRoutes = router;