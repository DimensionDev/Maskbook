export function captureFetchException(request: Request, response?: Response) {
    Sentry.captureException(new Error(`Failed to fetch: ${request.url}`), {
        tags: {
            source: new URL(request.url).host,
            method: request.method.toUpperCase(),
            url: request.url,
            response_type: response?.type,
            status_code: response?.status,
            status_text: response?.statusText,
        },
    })
}
