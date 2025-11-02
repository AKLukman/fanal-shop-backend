import { z } from 'zod';

const create = z.object( {
  body: z.object( {
    customerId: z.string( {
      required_error: 'Customer Id is required',
    } ),
    productId: z.string( {
      required_error: 'Product Id is required',
    } ),
    rating: z.number( {
      required_error: 'Rating is required',
    } ),
    comment: z.string( {
      required_error: 'Comment is required',
    } )

  } ),
} );

export const ReviewValidation = {
  create,
};
