export async function extraPermissions(origins: string[] | null) {
    if (!origins) return []
    const currentOrigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter((i) => !currentOrigins?.includes(i))
    return extra.length ? extra : []
}
