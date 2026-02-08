import { NextResponse } from "next/server"

function getBackendBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_BASE_URL ||
    process.env.BACKEND_API_URL ||
    "http://127.0.0.1:8000"

  return raw.replace(/\/$/, "")
}

function buildFallbackSyncResult() {
  return {
    lastSync: new Date().toISOString(),
    recordsSynced: {
      dishes: 0,
      ingredients: 0,
      orders: 0,
      analytics: 0,
    },
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      lastSync: new Date().toISOString(),
    },
  })
}

export async function POST() {
  const backendBaseUrl = getBackendBaseUrl()

  try {
    const response = await fetch(`${backendBaseUrl}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (response.ok) {
      const payload = await response.json().catch(() => null)

      if (payload && typeof payload === "object" && "success" in payload) {
        return NextResponse.json(payload)
      }

      if (payload && typeof payload === "object") {
        return NextResponse.json({ success: true, data: payload })
      }
    }

    return NextResponse.json({
      success: true,
      data: buildFallbackSyncResult(),
      warning: "Backend sync service is unavailable. Returned fallback response.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        data: buildFallbackSyncResult(),
        warning: "Sync request failed. Returned fallback response.",
      },
      { status: 200 },
    )
  }
}
