import { Router } from "express";
import { OrderControllers } from "./order.controllers";
import { ENUM_USER_ROLE } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { OrderZodValidations } from "./order.validation";

const router = Router();

router.post( "/", OrderControllers.insertIntoDB )
router.get( "/", auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ), OrderControllers.getOrdersFromDB )
router.get( "/my",
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER ),
    OrderControllers.getCustomerOrders )
router.get( "/:id", auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER ), OrderControllers.getOrderById )
router.patch( '/status/:id',
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN ),
    validateRequest( OrderZodValidations.update ),
    OrderControllers.updateFromDB

)

router.delete( "/:id",
    auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN ),
    OrderControllers.deleteFromDB
)

export const OrderRoutes = router;