import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/private'], // Admin və gizli səhifələri bloklayın
        },
        sitemap: 'https://avtomir.az/sitemap.xml', // Real domain adınızı yazın
    }
}
