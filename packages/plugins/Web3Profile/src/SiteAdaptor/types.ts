export interface LensStorageType {
    accessToken?: {
        [property: string]: {
            token: string
            expireDate: Date
        }
    }
    refreshToken?: {
        [property: string]: {
            token: string
            expireDate: Date
        }
    }
}
