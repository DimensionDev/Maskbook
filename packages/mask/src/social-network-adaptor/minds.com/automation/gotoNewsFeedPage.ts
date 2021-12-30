export function gotoNewsFeedPageMinds() {
    if (location.pathname.includes('/newsfeed/subscriptions')) return
    else location.pathname = '/newsfeed/subscriptions'
}
