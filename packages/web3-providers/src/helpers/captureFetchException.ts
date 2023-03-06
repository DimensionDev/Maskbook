export async function captureFetchException(request: Request, response?: Response) {
    Sentry.captureException(new Error(`Failed to fetch: ${request.url}`), {
        tags: {
            source: new URL(request.url).host,
            method: request.method.toUpperCase(),
            url: request.url,
            response_type: response?.type,
            status_code: response?.status,
            status_text: response?.statusText,
            request_headers: JSON.stringify(Object.fromEntries(request.headers.entries())),
            request_body: await getRequestJSON(request.clone()),
            request_text: await getRequestText(request.clone()),
        },
    })
}
function getRequestJSON(request: Request) {
    try {
        return request.json()
    } catch {
        return
    }
}

function getRequestText(request: Request) {
    try {
        return request.text()
    } catch {
        return
    }
}
