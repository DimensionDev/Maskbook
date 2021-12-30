export function gotoNewsFeedPageTwitter() {
    if (location.pathname.includes('/home')) location.reload()
    else location.pathname = '/home'
}
