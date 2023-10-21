export function getCookie(field: string) {
    const pair = document.cookie.split('; ').find((x) => x.startsWith(`${field}=`))
    if (!pair) return ''
    const [, value] = pair.split('=')
    return value
}
