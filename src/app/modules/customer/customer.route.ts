import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CustomerControllers } from './customer.controller';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
    '/',
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    CustomerControllers.getAllFromDB
);



router.patch(
    '/:id',
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER ),
    CustomerControllers.updateIntoDB
);

router.delete(
    '/:id',
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    // PatientController.deleteFromDB
);
router.delete(
    '/soft/:id',
    auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
    CustomerControllers.softDelete
);

export const PatientRoutes = router;
