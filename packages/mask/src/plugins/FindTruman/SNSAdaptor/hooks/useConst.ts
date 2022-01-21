import { useI18N } from '../../../../utils'
import { fetchConst } from '../../Worker/apis'
import { useCallback, useEffect, useState } from 'react'
import type { FindTrumanConst } from '../../types'
import { FindTruman_Const } from '../../constants'

function replaceAll(input: string, values: Record<string, string | number>) {
    return input.replace(/{{([^}]+)}}/g, (match, p1) => values[p1]?.toString() ?? match)
}

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
        (id: string, options: Record<string, string | number> = {}) => {
            return replaceAll(consts?.locales?.[id] ?? '', options)
        },
        [consts],
    )

    return { consts, t }
}
