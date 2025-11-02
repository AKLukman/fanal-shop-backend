import { OrderStatus } from "@prisma/client";

export type IOrder = {
    orderStatus: OrderStatus
}

export type IOrderFilterRequest = {
    searchTerm?: string;
    orderStatus?: string;
}