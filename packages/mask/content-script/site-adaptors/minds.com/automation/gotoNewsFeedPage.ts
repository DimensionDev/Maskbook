export function gotoNewsFeedPageMinds() {
    const path = '/newsfeed/subscriptions'
    if (location.pathname.includes(path)) return
    location.assign(path)
}
