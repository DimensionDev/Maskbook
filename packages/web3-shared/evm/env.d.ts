/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />

declare module 'ethereum-blockies' {
    export interface BlockieOptions {
        seed?: string // seed used to generate icon data, default: random
        color?: string // to manually specify the icon color, default: random
        bgcolor?: string // choose a different background color, default: white
        size?: number // width/height of the icon in blocks, default: 10
        scale?: number // width/height of each block in pixels, default: 5
    }

    export function create(options?: BlockieOptions): HTMLCanvasElement
}
