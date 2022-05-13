import { type Option, None } from 'ts-results'

export abstract class Identifier {
    abstract toText(): string
    abstract [Symbol.toStringTag]: string
    /** We mark this as private because it's encouraged to use toText(). toString is for JavaScript runtime accidentally calling. */
    private toString() {
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
