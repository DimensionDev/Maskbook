declare namespace Intl {
    export interface SegmenterOptions {
        granularity?: 'grapheme' | 'word' | 'sentence'
    }
    export class Segmenter {
        constructor(lang: string, options?: SegmenterOptions)
        segment(word: string): Iterable<{ segment: string; index: number; input: string; isWordLike: boolean }>
    }
}
