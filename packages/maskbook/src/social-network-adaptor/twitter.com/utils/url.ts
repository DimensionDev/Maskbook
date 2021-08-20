export const twitterUrl = {
    hostIdentifier: 'twitter.com',
    hostLeadingUrl: 'https://twitter.com',
    hostLeadingUrlMobile: 'https://mobile.twitter.com',
}

export const hostLeadingUrlAutoTwitter = (isMobile: boolean) =>
    isMobile ? twitterUrl.hostLeadingUrlMobile : twitterUrl.hostLeadingUrl

// more about twitter photo url formating: https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/entities-object#photo_format
export const canonifyImgUrl = (url: string) => {
    const parsed = new URL(url)
    if (parsed.hostname !== 'pbs.twimg.com') {
        return url
    }
    const { searchParams } = parsed
    searchParams.set('name', 'orig')
    // we can't understand original image format when given url labeled as webp
    if (searchParams.get('format') === 'webp') {
        searchParams.set('format', 'png')
        const pngURL = parsed.href
        searchParams.set('format', 'jpg')
        const jpgURL = parsed.href
        return [pngURL, jpgURL]
    }
    return parsed.href
}
