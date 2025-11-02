import { z } from "zod";

const create = z.object( {
    body: z.object( {
        name: z.string( { required_error: "Category name is required!" } )
    } )
} )
const update = z.object( {
    body: z.object( {
        name: z.string( { required_error: "Category name is required!" } )
    } )
} )

export const CategoryZodValidations = {
    create,
    update
}