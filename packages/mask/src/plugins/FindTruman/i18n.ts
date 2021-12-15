export class FindTrumanI18n {
    nestingPrefix = '{{'
    nestingSuffix = '}}'
    nestingRegexpStr = `${this.nestingPrefix}(.+?)${this.nestingSuffix}`
    nestingRegexp = new RegExp(this.nestingRegexpStr, 'g')

    locales: { [id: string]: string } = {}

    constructor(locales: { [id: string]: string }) {
        this.locales = locales
    }

    t = (id: string, options?: { [key: string]: string | number }) => {
        let key = this.locales[id]
        if (!!key && options && Object.keys(options).length > 0) {
            const m = key.match(this.nestingRegexp)
            if (m && m.length > 0) {
                for (const k in options) {
                    const regexpStr = `${this.nestingPrefix}${k}${this.nestingSuffix}`
                    key = key.replaceAll(regexpStr, `${options[k]}`)
                }
            }
        }
        return key
    }
}
