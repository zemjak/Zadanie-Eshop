export interface BaseResponse {
    result: boolean;
}

export interface ErrorResponse extends BaseResponse {
    error: string;
}

export interface GetProductSearchParams {
    page?: number;
    limit?: number;
    name_query?: string;
    order_by?: string;
    order?: string;
}

export interface ProductsResponse extends BaseResponse {
    data: {
        limit: number;
        page: number;
        total_orders: number;
        total_pages: number;
        products: Array<{
            _id: string;
            name: string;
            price: number;
            stock: number;
        }>;
    }
}

export interface CreateOrderRequest {
    email: string;
    products: Array<{id: string; quantity: number}>;
}

export interface GetOrdersSearchParams {
    page?: number;
    limit?: number;
    filter_email?: string;
    filter_status?: string;
}

export interface OrdersResponse extends BaseResponse {
    data: {
        limit: number;
        page: number;
        total_orders: number;
        total_pages: number;
        orders: Array<{
            _id: string;
            email: string;
            created_at: string;
            total_price: number;
            status: string;
            products: Array<{
                _id: string;
                name: string;
                price: number;
                quantity: number;
            }>;
        }>;
    }
}

export interface DeleteOrderRequest {
    order_id: string;
}