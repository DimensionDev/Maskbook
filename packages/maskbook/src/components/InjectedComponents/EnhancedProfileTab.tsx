import classnames from 'classnames'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { MaskMessage } from '../../utils'

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
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: false })
        reset()
    }
    const onOpen = () => {
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: true })
        setActive(true)
    }

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on(onClose)
    }, [])

    const onClick = useCallback(() => {
        onOpen()
        clear()
    }, [clear, onOpen])

    return (
        <div key="nfts" className={classes.tab}>
            <div className={classnames(classes.button, active ? classes.selected : '')} onClick={onClick}>
                NFTs
                {active && children ? children : null}
            </div>
        </div>
    )
}
