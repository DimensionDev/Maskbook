import { memo, useContext } from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { NormalHeader } from '../../../../components/index.js'
import Services from '../../../../../service.js'
import { PageTitleContext } from '../../../../context.js'
import { useUpdateEffect } from '@react-hookz/web'

export const PersonaHeader = memo(function PersonaHeader() {
    const location = useLocation()
    const { setExtension } = useContext(PageTitleContext)
    const matchHome = useMatch(PopupRoutes.Personas)

    useUpdateEffect(() => {
        setExtension(undefined)
    }, [location.pathname, setExtension])

    if (matchHome) return null

    return <NormalHeader onClose={Services.Helper.removePopupWindow} />
})
