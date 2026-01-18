import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://avtomir.az' // Real domain

    // 1. Məhsulları API-dən çəkirik (İlk 1000 məhsul - sitemap üçün limit)
    let productUrls: MetadataRoute.Sitemap = [];
    try {
        const productsRes = await getProducts(1, 1000);
        const products = productsRes?.data || [];

        productUrls = products.map((product) => ({
            url: `${baseUrl}/product/${product.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        }));
    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    // 2. Statik səhifələr
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    return [...staticPages, ...productUrls]
}
