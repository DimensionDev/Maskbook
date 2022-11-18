import Services from '../../extension/service.js'
import { cache, use } from 'react'
import type {} from 'react/next'

const Request = cache(async function (url: string) {
    const blob = await Services.Helper.fetch(url)
    return URL.createObjectURL(blob)
})
export function useAssetAsBlobURL(url: string | URL) {
    return use(Request(url.toString()))
}
