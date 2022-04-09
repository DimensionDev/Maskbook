export {}
// A simple polyfill. Enough for us.
if (!Intl.ListFormat) {
    // @ts-ignore
    Intl.ListFormat = class {
        constructor(public locales?: string | Partial<Intl.ListFormatOptions>, options?: Intl.ListFormatOptions) {}
        format(string: string[]) {
            const locale = typeof this.locales === 'string' ? this.locales : navigator.language
            if (locale.startsWith('zh')) return string.join('\u3001')
            if (locale.startsWith('ja')) return string.join('\u3001')
            return string.join(', ')
        }
    }
}
