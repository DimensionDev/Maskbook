import { useI18N } from '../../../../utils'
import { fetchConst } from '../../Worker/apis'
import { useCallback, useEffect, useState } from 'react'
import type { FindTrumanConst } from '../../types'
import { FindTruman_Const } from '../../constants'

export function useConst() {
    const { i18n } = useI18N()
    const [consts, setConsts] = useState<FindTrumanConst>()

    useEffect(() => {
        if (!FindTruman_Const.initialized) {
            FindTruman_Const.init((resolve, reject) => {
                fetchConst(i18n.language)
                    .then((res) => {
                        resolve(res)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
        FindTruman_Const.then((res) => {
            setConsts(res)
        })
    }, [])

    const t = useCallback(
        (id: string) => {
            return consts?.locales[id] || ''
        },
        [consts],
    )

    return { consts, t }
}
