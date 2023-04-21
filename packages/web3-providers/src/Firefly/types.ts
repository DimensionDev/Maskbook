export type Result<T> = {
    code: number
    reason: string
    message: string
    data: T
}

export interface FireflyLensAccount {
    address: string
    name: string
    handle: string
    bio: string
    url: string
    profileUri: string[]
}

export type LensResult = Result<FireflyLensAccount[]>
