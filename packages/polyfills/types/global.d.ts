interface WindowEventMap {
    scenechange: CustomEvent<{ scene: 'profile'; value: string }> | CustomEvent<{ scene: 'unknown' }>
}

// https://github.com/microsoft/TypeScript/issues/29729#issuecomment-1483854699
interface Nothing {}
// We discard boolean as the default type.
type LiteralUnion<
    U,
    T = U extends string ? string
    : U extends number ? number
    : never,
> = U | (T & Nothing)

type HexString = `0x${string}`
