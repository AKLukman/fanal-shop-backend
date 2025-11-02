import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { PatientRoutes } from '../modules/customer/customer.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { ReviewRoutes } from '../modules/review/review.route';
import { MetaRoutes } from '../modules/meta/meta.routes';
import { userRoutes } from '../modules/user/user.route';
import { CategoryRoutes } from '../modules/category/category.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { OrderRoutes } from '../modules/order/order.route';



const router = express.Router();

const moduleRoutes = [
  // ... routes

  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/customer',
    route: PatientRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/payment',
    route: paymentRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/metadata',
    route: MetaRoutes,
  },

];

moduleRoutes.forEach( route => router.use( route.path, route.route ) );
export default router;
