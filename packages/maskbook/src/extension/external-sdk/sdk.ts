import Services from '../service'

/** Version of this SDK */
export async function version() {
    return 1
}
export async function echo<T>(x: T) {
    return x
}
export async function getProfile() {
    return (await Services.Identity.queryProfiles()).map((x) => x.identifier.userId)
}
