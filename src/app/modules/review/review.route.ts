import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validations';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();
router.get( '/',
  auth( ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
  ReviewController.getAllFromDB
);

router.post(
  '/',
  auth( ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN ),
  validateRequest( ReviewValidation.create ),
  ReviewController.insertIntoDB,
);

export const ReviewRoutes = router;
