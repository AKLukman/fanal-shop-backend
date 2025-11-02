import { z } from "zod"

const update = z.object( {
    body: z.object( {
        orderStatus: z.string( { required_error: "Order status is required!" } )
    } )
} )

export const OrderZodValidations = {
    update
}