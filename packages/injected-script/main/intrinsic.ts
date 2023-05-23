export * as $ from './intrinsic_content.js'
export * as $Content from './intrinsic_main.js'
export * as $Blessed from './intrinsic_blessed.js'
export * from './intrinsic_brand.js'

export type Setter<T> = (val: T) => void
export type Getter<T> = () => T
