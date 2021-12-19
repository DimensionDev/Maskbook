import { fetchJSON } from '../../../extension/background-script/HelperService'

export async function fetch(
    url: string,
    options: { baseURL: string; params?: { [key: string]: string } },
): Promise<any> {
    const urlObj = new URL(url, options.baseURL)
    for (const key in options.params) {
        urlObj.searchParams.set(key, options.params[key])
    }
    try {
        const res = await fetchJSON(urlObj.href)
        return {
            data: res,
        }
    } catch (error) {
        throw error
    }
}
