type Response<T> = T | { error: string }

export type RSS3NameServiceResponse = Response<{
    ens: string
    crossbell: string
    lens: string
    spaceid: string
    unstoppable_domains: string
    bit: string
    /** hex address */
    address: string
}>
