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
    const response = await fetch(`${EFP_API_URL}${apiPath}`, {
        headers: {
            Accept: 'application/json',
        },
    })
    if (!response.ok) throw new Error('Failed to fetch EFP profile')
    return response.json() as Promise<EFPProfileResponse>
}
