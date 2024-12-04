export interface EIP2255Caveat {
    type: string
    value: unknown
}
export interface EIP2255Permission {
    invoker: string
    parentCapability: string
    caveats: EIP2255Caveat[]
    /** unix timestamp */
    createdAt?: number
}
export interface EIP2255RequestedPermission {
    parentCapability: string
    date?: number
}
export interface EIP2255PermissionRequest {
    [methodName: string]: {
        [caveatName: string]: unknown
    }
}
