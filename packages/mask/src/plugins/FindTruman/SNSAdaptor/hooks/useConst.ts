import { useI18N } from '../../../../utils/index.js'
import { fetchConst } from '../../Worker/apis/index.js'
import { useCallback, useEffect, useState } from 'react'
import type { FindTrumanConst } from '../../types.js'
import { FindTruman_Const } from '../../constants.js'

function renderString(template: string, data: Record<string, string | number>) {
    return template.replace(/{{([^}]+)}}/g, (match, p1) => data[p1]?.toString() ?? match)
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
            return renderString(consts?.locales?.[id] ?? '', options)
        },
        [consts],
    )

    return { consts, t }
}
