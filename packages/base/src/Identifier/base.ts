import { type Option, None } from 'ts-results-es'

export abstract class Identifier {
    abstract toText(): string
    abstract [Symbol.toStringTag]: string
    /** @internal */
    toString() {
        return this.toText()
    }
    static from(input: string | undefined | null): Option<Identifier> {
        // this method will be override in ./utils
        return None
    }
    static [Symbol.hasInstance](x: unknown): boolean {
        // this method will be override in ./utils
        return false
    }
}
