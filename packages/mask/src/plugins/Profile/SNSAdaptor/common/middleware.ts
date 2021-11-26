import Services from '../../../../extension/service'

const authorizedOrigins: string[] = []
async function preFetchTestOrigin(origin: string) {
    if (!authorizedOrigins.includes(origin)) {
        try {
            await Services.Helper.requestExtensionPermission({
                origins: [origin + '/'],
                permissions: ['webRequest'],
            })
            authorizedOrigins.push(origin)
        } catch (error) {
            throw error
        }
    }
}

export async function fetch(
    url: string,
    options: { baseURL: string; params?: { [key: string]: string } },
): Promise<any> {
    const urlObj = new URL(url, options.baseURL)
    for (const key in options.params) {
        urlObj.searchParams.set(key, options.params[key])
    }
    try {
        await preFetchTestOrigin(urlObj.origin)
        const res = await Services.Helper.fetchJSON(urlObj.href)
        return {
            data: res,
        }
    } catch (error) {
        throw error
    }
}
