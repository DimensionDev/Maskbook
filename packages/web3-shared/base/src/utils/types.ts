export type ChainIdEnum<ChainId extends number> = {
    [key in ChainId]: string
} & {
    [key in 'Mainnet']: number
}

export type Primitive = string | number | boolean | symbol | undefined | null | bigint

export type Constant<T = Primitive | Primitive[]> = {
    [key in 'Mainnet']?: T
}

export type Constants<T = Primitive | Primitive[]> = Record<string, Constant<T>>
