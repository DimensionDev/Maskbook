import { IdentifierMap } from '../IdentifierMap'
import { ProfileIdentifier, Identifier, PostIVIdentifier, PostIdentifier } from '../type'

const a = new ProfileIdentifier('localhost', 'id')
const aa = new ProfileIdentifier('localhost', 'id')
const b = new ProfileIdentifier('localhost', 'id2')
test('Map<Identifier, ?>', () => {
    const x = new IdentifierMap<Identifier, number>(new Map())
    x.set(a, 1)

    expect(x.get(a)).toBe(1)
    expect(Array.from(x.values())).toStrictEqual([1])
    expect(Array.from(x.keys())).toStrictEqual([a])
    expect(Array.from(x.entries())).toStrictEqual([[a, 1]])

    expect(x.has(aa)).toBeTruthy()
    expect(x.has(b)).toBeFalsy()
    expect(x.size).toBe(1)

    x.set(aa, 2)
    expect(x.get(a)).toBe(2)

    x.set(b, 3)
    expect(Array.from(x.values())).toStrictEqual([2, 3])
    expect(Array.from(x.keys())).toStrictEqual([a, b])
    expect(Array.from(x.entries())).toStrictEqual([
        [a, 2],
        [b, 3],
    ])

    x.delete(a)
    expect(x.size).toBe(1)

    // Invalid write
    x.__raw_map__.set('invalid id', 3)
    expect(Array.from(x.keys())).toStrictEqual([b])
    expect(x.size).toBe(1)

    x.clear()
    expect(x.size).toBe(0)
})

const alienType = new PostIVIdentifier('nw', 'iv')
test('Map<T extends Identifier, ?>', () => {
    const x = new IdentifierMap(new Map<string, number>(), ProfileIdentifier)
    x.set(a, 1)

    // Invalid id
    x.set(alienType as any, 2)
    expect(Array.from(x.values())).toStrictEqual([1])

    // Invalid id force write
    x.__raw_map__.set(alienType.toText(), 2)
    expect(Array.from(x.values())).toStrictEqual([1])
})

const c = new PostIdentifier(a, 'iv')
test('Map<T2 extends Identifier, ?>', () => {
    const x = new IdentifierMap<ProfileIdentifier | PostIdentifier, number>(
        new Map(),
        ProfileIdentifier,
        PostIdentifier,
    )
    x.set(a, 1)
    x.set(c, 2)
    expect(x.get(a)).toBe(1)
    expect(x.get(c)).toBe(2)

    // Invalid id
    x.set(alienType as any, 2)
    expect(Array.from(x.values())).toStrictEqual([1, 2])

    // Invalid id force write
    x.__raw_map__.set(alienType.toText(), 2)
    expect(Array.from(x.values())).toStrictEqual([1, 2])
})
