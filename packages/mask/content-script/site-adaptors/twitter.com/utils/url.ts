import { regexMatch } from '../../../utils/utils.js'

// more about twitter photo url formatting:
// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/entities-object#photo_format
export const canonifyImgUrl = (url: string) => {
    const parsed = new URL(url)
    if (parsed.hostname !== 'pbs.twimg.com') return url
    const { searchParams } = parsed
    searchParams.set('name', 'orig')
    // we can't understand original image format when given url labeled as webp
    if (searchParams.get('format') === 'webp') {
        searchParams.set('format', 'png')
        const pngURL = parsed.href
        searchParams.set('format', 'jpg')
        const jpgURL = parsed.href
        return [jpgURL, pngURL]
    }
    return parsed.href
}

export const parseId = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}
