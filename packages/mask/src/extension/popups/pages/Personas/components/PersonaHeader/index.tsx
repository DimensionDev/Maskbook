import { memo, useContext } from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { NormalHeader } from '../../../../components/NormalHeader/index.js'
import Services from '../../../../../service.js'
import { PageTitleContext } from '../../../../context.js'
import { useUpdateEffect } from '@react-hookz/web'

export const PersonaHeader = memo(() => {
    const location = useLocation()
    const { extension, setExtension } = useContext(PageTitleContext)
    const matchHome = useMatch(PopupRoutes.Personas)

    useUpdateEffect(() => {
        setExtension(undefined)
    }, [location.pathname, setExtension])

    if (matchHome) return null

    return <NormalHeader onClose={Services.Helper.removePopupWindow} extension={extension} />
})
