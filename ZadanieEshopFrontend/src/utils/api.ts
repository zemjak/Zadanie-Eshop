import { API_URL } from "./consts";
import * as apiTypes from "./apiTypes";

async function generateHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept-Encoding": "identity",
    Connection: "close",
  };
  return headers;
}

export async function getProducts(
  searchParams: apiTypes.GetProductSearchParams
): Promise<apiTypes.ProductsResponse | apiTypes.ErrorResponse> {
  try {
    const urlParams = new URLSearchParams(
      searchParams as Record<string, string>
    ).toString();
    const response = await fetch(`${API_URL}products?${urlParams}`, {
      method: "GET",
      headers: await generateHeaders(),
    });

    const responseBody = await response.json();
    if (response.ok && responseBody.data) {
      return { result: true, data: responseBody.data };
    } else {
      return {
        result: false,
        error: responseBody.error || "Failed to get products.",
      };
    }
  } catch (error) {
    return { result: false, error: "Network error, try again later." };
  }
}

export async function createOrder(
  requestBody: apiTypes.CreateOrderRequest
): Promise<apiTypes.BaseResponse | apiTypes.ErrorResponse> {
  try {
    const response = await fetch(`${API_URL}orders`, {
      method: "POST",
      headers: await generateHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201) {
      return { result: true };
    } else {
      const responseBody = await response.json();
      return {
        result: false,
        error: responseBody.error || "Failed to create order.",
      };
    }
  } catch (error) {
    console.log(error);
    return { result: false, error: "Network error, try again later" };
  }
}

export async function getOrders(
  searchParams: apiTypes.GetOrdersSearchParams
): Promise<apiTypes.OrdersResponse | apiTypes.ErrorResponse> {
  try {
    const urlParams = new URLSearchParams(
      searchParams as Record<string, string>
    ).toString();
    const response = await fetch(`${API_URL}orders?${urlParams}`, {
      method: "GET",
      headers: await generateHeaders(),
    });

    const responseBody = await response.json();
    if (response.ok && responseBody.data) {
      return { result: true, data: responseBody.data };
    } else {
      return {
        result: false,
        error: responseBody.error || "Failed to get orders.",
      };
    }
  } catch (error) {
    return { result: false, error: "Network error, try again later." };
  }
}

export async function deleteOrder(
  requestBody: apiTypes.DeleteOrderRequest
): Promise<apiTypes.BaseResponse | apiTypes.ErrorResponse> {
  try {
    const response = await fetch(`${API_URL}orders/${requestBody.order_id}`, {
      method: "DELETE",
      headers: await generateHeaders(),
    });

    if (response.status === 204) {
      return { result: true };
    } else {
      const responseBody = await response.json();
      return {
        result: false,
        error: responseBody.error || "Failed to cancel order.",
      };
    }
  } catch (error) {
    return { result: false, error: "Network error, try again later." };
  }
}
