import { renderString } from '@masknet/shared-base'
import { useCallback, useEffect, useState } from 'react'
import { useI18N } from '../../../../utils'
import { FindTruman_Const } from '../../constants'
import type { FindTrumanConst } from '../../types'
import { fetchConst } from '../../Worker/apis'

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
