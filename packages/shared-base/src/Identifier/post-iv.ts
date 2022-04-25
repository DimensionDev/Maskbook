import { decodeArrayBuffer } from '@dimensiondev/kit'
import { type Option, None } from 'ts-results'
import { Identifier } from './base'
import { banSlash } from './utils'

const instance = new WeakSet()
const id: Record<string, Record<string, PostIVIdentifier>> = Object.create(null)
export class PostIVIdentifier extends Identifier {
    static override from(x: string): Option<PostIVIdentifier> {
        x = String(x)
        if (x.startsWith('post_iv:')) return Identifier.from(x) as Option<PostIVIdentifier>
        return None
    }
    declare readonly network: string
    declare readonly postIV: string
    constructor(network: string, postIV: string) {
        network = String(network)
        postIV = String(postIV)

        const networkCache = (id[network] ??= {})
        if (networkCache[postIV]) return networkCache[postIV]

        banSlash(network)
        super()
        this.network = network
        this.postIV = postIV
        Object.freeze(this)
        networkCache[postIV] = this
        instance.add(this)
    }
    toText() {
        return `post_iv:${this.network}/${this.postIV.replace(/\//g, '|')}`
    }
    toIV() {
        const x = this.postIV.replace(/\|/g, '/')
        return new Uint8Array(decodeArrayBuffer(x))
    }
    declare [Symbol.toStringTag]: string
    static [Symbol.hasInstance](x: any): boolean {
        return instance.has(x)
    }
}
PostIVIdentifier.prototype[Symbol.toStringTag] = 'PostIVIdentifier'
Object.freeze(PostIVIdentifier.prototype)
Object.freeze(PostIVIdentifier)
