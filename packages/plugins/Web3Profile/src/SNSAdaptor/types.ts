export interface LensTokenStorageType {
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

/**
 * Bounding of the lens badge, can be used to position the LensPopup
 */
export interface BadgeBounding extends DOMRect {
    height: number
    width: number
    left: number
    top: number
    right: number
}
