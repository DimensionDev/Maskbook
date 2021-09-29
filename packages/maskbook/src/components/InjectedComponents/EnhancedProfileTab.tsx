import { Typography } from '@material-ui/core'
import classnames from 'classnames'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { MaskMessages } from '../../utils'

export interface EnhancedProfileTabProps extends withClasses<'tab' | 'button' | 'selected'> {
    clear(): void
    reset(): void
    children?: ReactElement
    // Required! This component don't have it own style.
    classes: Record<'tab' | 'button' | 'selected', string>
}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const { reset, clear, children, classes } = props
    const [active, setActive] = useState(false)

    const onClose = () => {
        setActive(false)
        MaskMessages.events.profileNFTsPageUpdated.sendToLocal({ show: false })
        reset()
    }
    const onOpen = () => {
        MaskMessages.events.profileNFTsPageUpdated.sendToLocal({ show: true })
        setActive(true)
    }

    useEffect(() => {
        return MaskMessages.events.profileNFTsTabUpdated.on(onClose)
    }, [])

    const onClick = useCallback(() => {
        onOpen()
        clear()
    }, [clear, onOpen])

    return (
        <div key="nfts" className={classes.tab}>
            <Typography
                className={classnames(classes.button, active ? classes.selected : '')}
                onClick={onClick}
                component="div">
                NFTs
                {active && children ? children : null}
            </Typography>
        </div>
    )
}
