export class FindTrumanI18n {
    nestingPrefix = '{{'
    nestingSuffix = '}}'
    nestingPattern = new RegExp(`${this.nestingPrefix}(.+?)${this.nestingSuffix}`, 'g')

    locales: Record<string, string> = {}

    constructor(locales: Record<string, string>) {
        this.locales = locales
    }

    t = (id: string, options?: { [key: string]: string | number }) => {
        let key = this.locales[id]
        if (!!key && options && Object.keys(options).length > 0) {
            const m = key.match(this.nestingPattern)
            if (m && m.length > 0) {
                for (const k in options) {
                    const pattern = new RegExp(`${this.nestingPrefix}${k}${this.nestingSuffix}`)
                    key = key.replaceAll(pattern, `${options[k]}`)
                }
            }
        }
        return key
    }
}
