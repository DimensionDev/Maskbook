export async function extraPermissions(origins: string[] | null) {
    if (!origins) return null
    const currentorigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter(i => !currentorigins?.includes(i))
    return extra.length ? extra : null
}
