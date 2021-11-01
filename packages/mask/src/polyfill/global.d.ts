declare namespace Intl {
    export interface ListFormatOptions {
        localeMatcher: 'lookup' | 'best fit'
        type: 'conjunction' | 'disjunction' | 'unit'
        style: 'long' | 'short' | 'narrow'
    }
    export class ListFormat {
        constructor(options?: Partial<ListFormatOptions>)
        constructor(locales?: string, options?: Partial<ListFormatOptions>)
        format(str: string[]): string
    }
    export interface SegmenterOptions {
        granularity?: 'grapheme' | 'word' | 'sentence'
    }
    export class Segmenter {
        constructor(lang: string, options?: SegmenterOptions)
        segment(word: string): Iterable<{ segment: string; index: number; input: string; isWordLike: boolean }>
    }
}
