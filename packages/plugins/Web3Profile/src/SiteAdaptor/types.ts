export interface LensStorageType {
    accessToken?: Record<
        string,
        {
            token: string
            expireDate: Date
        }
    >
    refreshToken?: Record<
        string,
        {
            token: string
            expireDate: Date
        }
    >
}
