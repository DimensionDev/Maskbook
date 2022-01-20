import { useI18N } from '../../../../utils'
import { fetchConst } from '../../Worker/apis'
import { useCallback, useEffect, useState } from 'react'
import type { FindTrumanConst } from '../../types'
import { FindTruman_Const } from '../../constants'

const NestingPrefix = '{{'
const NestingSuffix = '}}'
const NestingPattern = new RegExp(`${NestingPrefix}(.+?)${NestingSuffix}`, 'g')

export function useConst() {
    const { i18n } = useI18N()
    const [consts, setConsts] = useState<FindTrumanConst>()

    useEffect(() => {
        if (!FindTruman_Const.initialized) {
            FindTruman_Const.init((resolve, reject) => {
                fetchConst(i18n.language).then(resolve).catch(reject)
            })
        }
        FindTruman_Const.then((res) => {
            setConsts(res)
        })
    }, [])

    const t = useCallback(
        (id: string, options?: { [key: string]: string | number }) => {
            if (!consts?.locales) return ''
            let key = consts.locales[id]
            if (!!key && options && Object.keys(options).length > 0) {
                const m = key.match(NestingPattern)
                if (m && m.length > 0) {
                    for (const k in options) {
                        const pattern = new RegExp(`${NestingPrefix}${k}${NestingSuffix}`, 'g')
                        key = key.replaceAll(pattern, options[k].toString())
                    }
                }
            }
            return key
        },
        [consts],
    )

    return { consts, t }
}
