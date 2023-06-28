import { cache, use } from 'react'
import { fetchBlob } from '@masknet/web3-providers/helpers'

const Request = cache(async function (url: string) {
    const blob = await fetchBlob(url)
    return URL.createObjectURL(blob)
})

export function useAssetAsBlobURL(url: string | URL) {
    return use(Request(url.toString()))
}
