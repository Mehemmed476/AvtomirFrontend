import { ApiResponse, Settings } from "@/types";
import { API_URL } from "./api";
import Cookies from "js-cookie";

// Token-i cookie-dən oxu
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('token') || null;
}

// Helper to determine the correct API URL for server-side fetching
function getFetchUrl() {
    // If API_URL is relative (starts with /), it means it's for client-side proxy.
    // Server-side fetch cannot use relative URLs.
    if (API_URL.startsWith('/')) {
        // In dev, usually the backend is at 5001 or we can use the public URL if defined
        // But safely, let's assume we want to hit the external production API if we are building locally?
        // OR we should trust NEXT_PUBLIC_API_URL if it exists.
        return process.env.NEXT_PUBLIC_API_URL || "https://avtomir.az/api";
    }
    return API_URL;
}

export async function getSettings(): Promise<Settings | null> {
    try {
        const baseUrl = getFetchUrl();
        const res = await fetch(`${baseUrl}/settings`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}

// Client-side: Get settings for admin panel
export async function getSettingsClient(): Promise<Settings | null> {
    try {
        const res = await fetch(`${API_URL}/settings`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}

// Update settings (Admin only)
export async function updateSettings(data: Settings): Promise<ApiResponse<boolean>> {
    const token = getToken();

    if (!token) {
        return {
            success: false,
            message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
            data: false,
            statusCode: 401,
            errors: ["Unauthorized"]
        };
    }

    try {
        const res = await fetch(`${API_URL}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return {
                success: false,
                message: `Ayarlar yenilənmədi: ${res.status} ${res.statusText}`,
                data: false,
                statusCode: res.status,
                errors: [errorText || "Update failed"]
            };
        }

        // Handle 204 No Content
        const text = await res.text();
        if (!text) {
            return {
                success: true,
                message: "Ayarlar uğurla yeniləndi",
                data: true,
                statusCode: res.status
            };
        }

        const result = JSON.parse(text);
        if (result.success === undefined) {
            return {
                success: true,
                message: result.message || "Ayarlar yeniləndi",
                data: true,
                statusCode: res.status
            };
        }

        return result;
    } catch (error) {
        console.error("Update Settings Error:", error);
        return {
            success: false,
            message: "Ayarlar yeniləmə xətası",
            data: false,
            statusCode: 500,
            errors: [(error as Error).message]
        };
    }
}
