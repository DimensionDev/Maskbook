/* cspell:disable */
import { attemptUntil, fetchImageViaDOM } from '@masknet/web3-shared-base'

const { fetch: originalFetch } = globalThis

const R2D2_ROOT_URL = 'r2d2.to'

export async function fetchR2D2(input: RequestInfo | URL, init?: RequestInit, next = originalFetch): Promise<Response> {
    const request = new Request(input, init)
    const url = request.url

    // hotfix image requests
    if (request.method === 'GET' && request.headers.get('accept')?.includes('image/')) {
        return new Response(
            await attemptUntil<Blob | null>(
                [
                    async () => {
                        const response = await originalFetch(url, request)
                        return response.blob()
                    },
                    () => fetchImageViaDOM(url),
                ],
                null,
            ),
            {
                headers: {
                    'Content-Type': 'image/png',
                },
            },
        )
    }

    // r2d2
    if (url.includes(R2D2_ROOT_URL)) return next(request, init)

    // fallback
    return next(request, init)
}
