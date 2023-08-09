export const isMobileTwitter = !!navigator.userAgent.match(/Mobile|mobile/)

export const twitterDomain = isMobileTwitter ? 'https://mobile.twitter.com/' : 'https://twitter.com/'
