import { EFP_API_URL } from '../../constants.js'

export interface EFPProfileResponse {
    address?: string
    ens?: {
        name?: string | null
        records?: Record<string, string | undefined> | null
    } | null
    followers_count?: number | string
    following_count?: number | string
    primary_list?: string | null
}

export async function fetchEFPProfile(apiPath: string): Promise<EFPProfileResponse> {
    const url = `${EFP_API_URL}${apiPath}`
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`Failed to fetch EFP profile from ${apiPath} (status: ${response.status})`)
    }
    return response.json() as Promise<EFPProfileResponse>
}
