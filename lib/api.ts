// API layer for backend integration with camelCase/snake_case normalization
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DishIngredient {
  ingredientId: string
  quantity: number
  unit: string
  subIngredient?: {
    name: string
    description?: string
    preparation_method?: string
    cooking_time?: number
    temperature?: string
    notes?: string
  }
}

export interface Dish {
  id: string
  name: string
  price: number
  category: string
  description?: string
  preparationTime?: number
  difficultyLevel?: string
  ingredients: DishIngredient[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  quantityToday: number
  minThreshold: number
  costPerUnit: number
  supplier?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  dishId: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  timestamp: string
  status: "pending" | "completed" | "cancelled"
  paymentMethod: string
  customerId?: string
  cashierId: string
}

export interface SalesData {
  date: string
  morning: { orders: number; revenue: number; avgOrder: number }
  afternoon: { orders: number; revenue: number; avgOrder: number }
  evening: { orders: number; revenue: number; avgOrder: number }
  total: { orders: number; revenue: number; avgOrder: number }
}

export interface PredictionData {
  dishId: string
  dishName?: string
  period: "morning" | "afternoon" | "evening"
  predictedDemand: number
  confidence: number
  recommendedPrep: number
  factors: string[]
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toStringValue = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback
}

const toTimestamp = (value: unknown) => {
  return typeof value === "string" && value ? value : new Date().toISOString()
}

const extractErrorMessage = (payload: any, fallback: string) => {
  if (payload?.error && typeof payload.error === "string") return payload.error
  if (payload?.detail && typeof payload.detail === "string") return payload.detail
  return fallback
}

const mapDishIngredientFromBackend = (ingredient: any): DishIngredient => ({
  ingredientId: toStringValue(ingredient?.ingredientId ?? ingredient?.ingredient_id),
  quantity: toNumber(ingredient?.quantity),
  unit: toStringValue(ingredient?.unit),
  subIngredient: ingredient?.subIngredient ?? ingredient?.sub_ingredient,
})

const mapDishFromBackend = (dish: any): Dish => ({
  id: toStringValue(dish?.id),
  name: toStringValue(dish?.name),
  price: toNumber(dish?.price),
  category: toStringValue(dish?.category),
  description: dish?.description ?? undefined,
  preparationTime: dish?.preparationTime ?? dish?.preparation_time ?? undefined,
  difficultyLevel: dish?.difficultyLevel ?? dish?.difficulty_level ?? undefined,
  ingredients: Array.isArray(dish?.ingredients) ? dish.ingredients.map(mapDishIngredientFromBackend) : [],
  isActive: Boolean(dish?.isActive ?? dish?.is_active ?? true),
  createdAt: toTimestamp(dish?.createdAt ?? dish?.created_at),
  updatedAt: toTimestamp(dish?.updatedAt ?? dish?.updated_at),
})

const mapIngredientFromBackend = (ingredient: any): Ingredient => ({
  id: toStringValue(ingredient?.id),
  name: toStringValue(ingredient?.name),
  unit: toStringValue(ingredient?.unit),
  quantityToday: toNumber(ingredient?.quantityToday ?? ingredient?.quantity_today),
  minThreshold: toNumber(ingredient?.minThreshold ?? ingredient?.min_threshold),
  costPerUnit: toNumber(ingredient?.costPerUnit ?? ingredient?.cost_per_unit),
  supplier: ingredient?.supplier ?? undefined,
  createdAt: toTimestamp(ingredient?.createdAt ?? ingredient?.created_at),
  updatedAt: toTimestamp(ingredient?.updatedAt ?? ingredient?.updated_at),
})

const mapOrderItemFromBackend = (item: any): OrderItem => ({
  dishId: toStringValue(item?.dishId ?? item?.dish_id),
  quantity: toNumber(item?.quantity),
  price: toNumber(item?.price),
  notes: item?.notes ?? undefined,
})

const mapOrderFromBackend = (order: any): Order => ({
  id: toStringValue(order?.id),
  items: Array.isArray(order?.items) ? order.items.map(mapOrderItemFromBackend) : [],
  total: toNumber(order?.total),
  subtotal: toNumber(order?.subtotal),
  tax: toNumber(order?.tax),
  timestamp: toTimestamp(order?.timestamp),
  status: (order?.status as Order["status"]) ?? "pending",
  paymentMethod: toStringValue(order?.paymentMethod ?? order?.payment_method),
  customerId: order?.customerId ?? order?.customer_id ?? undefined,
  cashierId: toStringValue(order?.cashierId ?? order?.cashier_id),
})

const mapPeriodData = (period: any) => ({
  orders: toNumber(period?.orders),
  revenue: toNumber(period?.revenue),
  avgOrder: toNumber(period?.avgOrder ?? period?.avg_order),
})

const mapSalesDataFromBackend = (data: any): SalesData => ({
  date: toStringValue(data?.date),
  morning: mapPeriodData(data?.morning),
  afternoon: mapPeriodData(data?.afternoon),
  evening: mapPeriodData(data?.evening),
  total: mapPeriodData(data?.total),
})

const mapPredictionFromBackend = (prediction: any): PredictionData => ({
  dishId: toStringValue(prediction?.dishId ?? prediction?.dish_id),
  dishName: prediction?.dishName ?? prediction?.dish_name ?? undefined,
  period: (prediction?.period as PredictionData["period"]) ?? "morning",
  predictedDemand: toNumber(prediction?.predictedDemand ?? prediction?.predicted_demand),
  confidence: toNumber(prediction?.confidence),
  recommendedPrep: toNumber(prediction?.recommendedPrep ?? prediction?.recommended_prep),
  factors: Array.isArray(prediction?.factors) ? prediction.factors : [],
})

const mapDishIngredientToBackend = (ingredient: DishIngredient) => ({
  ingredient_id: ingredient.ingredientId,
  quantity: ingredient.quantity,
  unit: ingredient.unit,
  ...(ingredient.subIngredient ? { sub_ingredient: ingredient.subIngredient } : {}),
})

const mapDishToBackend = (dish: Partial<Dish>) => ({
  ...(dish.name !== undefined ? { name: dish.name } : {}),
  ...(dish.price !== undefined ? { price: dish.price } : {}),
  ...(dish.category !== undefined ? { category: dish.category } : {}),
  ...(dish.description !== undefined ? { description: dish.description } : {}),
  ...(dish.preparationTime !== undefined ? { preparation_time: dish.preparationTime } : {}),
  ...(dish.difficultyLevel !== undefined ? { difficulty_level: dish.difficultyLevel } : {}),
  ...(dish.isActive !== undefined ? { is_active: dish.isActive } : {}),
  ...(dish.ingredients !== undefined ? { ingredients: dish.ingredients.map(mapDishIngredientToBackend) } : {}),
})

async function request<TData, TRaw = unknown>(
  path: string,
  init?: RequestInit,
  mapData?: (raw: TRaw) => TData,
): Promise<ApiResponse<TData>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init)
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        error: extractErrorMessage(payload, `Request failed with status ${response.status}`),
      }
    }

    if (payload && typeof payload === "object" && "success" in payload) {
      const apiPayload = payload as ApiResponse<TRaw>
      if (!apiPayload.success) {
        return {
          success: false,
          error: extractErrorMessage(apiPayload, "Request failed"),
        }
      }

      const normalizedData = mapData && apiPayload.data !== undefined ? mapData(apiPayload.data) : (apiPayload.data as TData)
      return { success: true, data: normalizedData }
    }

    const normalizedData = mapData ? mapData(payload as TRaw) : (payload as TData)
    return { success: true, data: normalizedData }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network request failed",
    }
  }
}

export const api = {
  async getDishes(): Promise<ApiResponse<Dish[]>> {
    return request<Dish[], any[]>("/api/dishes", undefined, (data) => data.map(mapDishFromBackend))
  },

  async createDish(dish: Omit<Dish, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Dish>> {
    return request<Dish, any>(
      "/api/dishes",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapDishToBackend(dish)),
      },
      mapDishFromBackend,
    )
  },

  async updateDish(id: string, dish: Partial<Dish>): Promise<ApiResponse<Dish>> {
    return request<Dish, any>(
      `/api/dishes/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapDishToBackend(dish)),
      },
      mapDishFromBackend,
    )
  },

  async deleteDish(id: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dishes/${id}`, { method: "DELETE" })
  },

  async getIngredients(): Promise<ApiResponse<Ingredient[]>> {
    return request<Ingredient[], any[]>("/api/ingredients", undefined, (data) => data.map(mapIngredientFromBackend))
  },

  async updateIngredientQuantity(id: string, quantity: number): Promise<ApiResponse<Ingredient>> {
    return request<Ingredient, any>(
      `/api/ingredients/${id}/quantity`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      },
      mapIngredientFromBackend,
    )
  },

  async createOrder(order: Omit<Order, "id" | "timestamp">): Promise<ApiResponse<Order>> {
    const payload = {
      items: order.items.map((item) => ({
        dish_id: item.dishId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      payment_method: order.paymentMethod,
      customer_id: order.customerId,
      cashier_id: order.cashierId,
    }

    return request<Order, any>(
      "/api/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      mapOrderFromBackend,
    )
  },

  async getOrders(startDate?: string, endDate?: string): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    const query = params.toString()
    return request<Order[], any[]>(`/api/orders${query ? `?${query}` : ""}`, undefined, (data) => data.map(mapOrderFromBackend))
  },

  async getSalesData(startDate: string, endDate: string): Promise<ApiResponse<SalesData[]>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    })
    return request<SalesData[], any[]>(`/api/analytics/sales?${params.toString()}`, undefined, (data) =>
      data.map(mapSalesDataFromBackend),
    )
  },

  async getDailySales(date: string): Promise<ApiResponse<SalesData>> {
    return request<SalesData, any>(`/api/analytics/daily-sales?date=${encodeURIComponent(date)}`, undefined, mapSalesDataFromBackend)
  },

  async getPredictions(date: string): Promise<ApiResponse<PredictionData[]>> {
    return request<PredictionData[], any[]>(`/api/predictions?date=${encodeURIComponent(date)}`, undefined, (data) =>
      data.map(mapPredictionFromBackend),
    )
  },

  async generatePredictions(): Promise<ApiResponse<any>> {
    return request<any>("/api/predictions/generate", { method: "POST" })
  },

  async syncData(): Promise<ApiResponse<{ lastSync: string }>> {
    return request<{ lastSync: string }, any>("/api/sync", { method: "POST" }, (data) => ({
      lastSync: toTimestamp(data?.lastSync ?? data?.last_sync),
    }))
  },
}
