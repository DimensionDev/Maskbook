export * as $ from './intrinsic_content.js'
export * as $Content from './intrinsic_main.js'
export * as $Blessed from './intrinsic_blessed.js'
export * from './intrinsic_brand.js'

export type Setter<This, Key extends keyof This> = (this: This, val: This[Key]) => void
export type Getter<This, Key extends keyof This> = (this: This) => This[Key]
