export async function captureFetchException(request: Request, response?: Response) {
    const requestHeaders = getHeaders(request.clone())
    const responseHeaders = getHeaders(response?.clone())
    const requestBody = (await getBodyAsJSON(request.clone())) || (await getBodyAsText(request.clone()))
    const responseBody = (await getBodyAsJSON(response?.clone())) || (await getBodyAsText(response?.clone()))
    Sentry.captureException(
        new Error(
            [
                `Failed to fetch: ${request.url}`,
                `  with Request Headers: ${requestHeaders}`,
                `  with Request Body: ${requestBody}`,
                `  with Response Headers: ${responseHeaders}`,
                `  with Response Body: ${responseBody}`,
            ].join('\n'),
        ),
        {
            tags: {
                source: new URL(request.url).host,
                method: request.method.toUpperCase(),
                url: request.url,
                response_type: response?.type,
                status_code: response?.status,
                status_text: response?.statusText,
            },
        },
    )
}

function getHeaders(requestOrResponse?: Request | Response) {
    try {
        return JSON.stringify(Object.fromEntries(requestOrResponse?.headers.entries() ?? []))
    } catch {
        return 'N/A'
    }
}

function getBodyAsJSON(requestOrResponse?: Request | Response) {
    try {
        return requestOrResponse?.json()
    } catch {
        return 'N/A'
    }
}

function getBodyAsText(requestOrResponse?: Request | Response) {
    try {
        return requestOrResponse?.text()
    } catch {
        return 'N/A'
    }
}
