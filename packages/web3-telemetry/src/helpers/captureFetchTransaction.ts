import { Flags } from '@masknet/flags'

function isIgnoredRequest(request: Request) {
    return [
        // Twitter Identity API
        'mr8asf7i4h',
        // NextID
        'https://proof-service.next.id/v1/proof',
        // Twitter Assets
        'https://t.co',
        'https://pbs.twimg.com',
        'https://abs.twimg.com',
        'https://twitter.com',
        'https://x.com',
        // source code
        'https://maskbook.pages.dev',
        // KV
        'https://kv.r2d2.to/api/com.maskbook.pets',
        'https://kv.r2d2.to/api/com.maskbook.user',
        // ScamDB
        'https://scam.mask.r2d2.to',
        // CDN
        /* cspell:disable-next-line */
        'cdninstagram.com',
        /* cspell:disable-next-line */
        'fbcdn.net',
        'imgix.net',
    ].some((x) => request.url.includes(x))
}

function getHeaders(requestOrResponse?: Request | Response) {
    try {
        if (!requestOrResponse) return 'N/A'
        return JSON.stringify(Object.fromEntries(requestOrResponse.headers.entries()))
    } catch {
        return 'N/A'
    }
}

async function getBody(requestOrResponse?: Request | Response) {
    try {
        const text = await requestOrResponse?.text()
        return text ?? 'N/A'
    } catch {
        return 'N/A'
    }
}

export async function captureFetchTransaction(
    request: Request,
    response?: Response,
    options?: { status?: 'succeed' | 'failed'; startAt?: number; endAt?: number },
) {
    if (process.env.NODE_ENV === 'development') return
    if (!Flags.sentry_enabled) return
    if (!Flags.sentry_fetch_transaction_enabled) return
    if (typeof Sentry === 'undefined') return
    if (isIgnoredRequest(request)) return

    const requestHeaders = getHeaders(request.clone())
    const responseHeaders = getHeaders(response?.clone())
    const requestBody = await getBody(request.clone())
    const responseBody = await getBody(response?.clone())

    Sentry.withScope((scope) => {
        scope.setTags({
            source: new URL(request.url).host,
            method: request.method.toUpperCase(),
            url: request.url,
            response_type: response?.type,
            response_redirected: response?.redirected,
            status_code: response?.status,
            status_text: response?.statusText,
        })
        const span = Sentry.startInactiveSpan({
            name:
                request.url +
                [
                    `Failed to fetch: ${request.url}`,
                    `  with Request Headers: ${requestHeaders}`,
                    `  with Request Body: ${requestBody}`,
                    `  with Response Headers: ${responseHeaders}`,
                    `  with Response Body: ${responseBody}`,
                ].join('\n'),
            op: 'task',
            forceTransaction: true,
            // @ts-expect-error undocumented api
            startTimestamp: options?.startAt,
            attributes: {
                request_headers: requestHeaders,
                request_body: requestBody,
                response_headers: responseHeaders,
                response_body: responseBody,
                response_type: response?.type,
                response_code: response?.status,
                response_status: response?.statusText,
                response_redirected: response?.redirected,
            },
        })
        options?.status &&
            span.setStatus({
                code: options.status === 'succeed' ? 1 : 2,
            })
        span.end(options?.endAt)
    })
}
