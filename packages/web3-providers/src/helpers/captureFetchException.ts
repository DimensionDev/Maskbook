export async function captureFetchException(request: Request, response?: Response) {
    if (process.env.NODE_ENV === 'development') return

    const requestHeaders = getHeaders(request.clone())
    const responseHeaders = getHeaders(response?.clone())
    const requestBody = await getBody(request.clone())
    const responseBody = await getBody(response?.clone())

    const transaction = Sentry.startTransaction({
        name: request.url,
        tags: {
            source: new URL(request.url).host,
            method: request.method.toUpperCase(),
            url: request.url,
            response_type: response?.type,
            response_redirected: response?.redirected,
            status_code: response?.status,
            status_text: response?.statusText,
        },
        data: {
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
    const span = transaction.startChild({
        op: 'task',
        description: [
            `Failed to fetch: ${request.url}`,
            `  with Request Headers: ${requestHeaders}`,
            `  with Request Body: ${requestBody}`,
            `  with Response Headers: ${responseHeaders}`,
            `  with Response Body: ${responseBody}`,
        ].join('\n'),
    })

    span.finish()
    transaction.finish()
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
