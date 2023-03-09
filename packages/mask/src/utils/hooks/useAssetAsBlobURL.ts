import { cache, use } from 'react'
import Services from '../../extension/service.js'

const Request = cache(async function (url: string) {
    const blob = await Services.Helper.fetchBlob(url)
    return URL.createObjectURL(blob)
})
export function useAssetAsBlobURL(url: string | URL) {
    return use(Request(url.toString()))
}
