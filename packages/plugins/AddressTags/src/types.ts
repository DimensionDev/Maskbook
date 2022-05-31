export interface DefProfileProperty {
    description: string
    prop: string
    value: string
    value_description: string
}

export interface DefProfile {
    defProperties: DefProfileProperty[]
    galaxyCredentials: GalaxyCredential[]
}

export interface GalaxyCredential {
    id: string
    name: string
}

export interface POAPAction {
    event: {
        id: number
        fancy_id: string
        name: string
        event_url: string
        image_url: string
        country: string
        city: string
        description: string
        year: number
        start_date: string
        end_date: string
        expiry_date: string
        supply: number
    }
    tokenId: string
    owner: string
    chain: string
    created: string
}
