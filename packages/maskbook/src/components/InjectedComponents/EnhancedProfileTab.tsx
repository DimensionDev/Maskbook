import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import classnames from 'classnames'
import Color from 'color'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { MaskMessage } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: new Color(getMaskColor(theme).blue).alpha(0.1).toString(),
            cursor: 'pointer',
        },
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontWeight: 700,
        color: getMaskColor(theme).blue,
        '&:hover': {
            color: getMaskColor(theme).blue,
        },
    },
    selected: {
        color: 'black',
    },
}))
export interface EnhancedProfileTabProps extends withClasses<'tab' | 'button' | 'selected'> {
    clear(): void
    reset(): void
    children?: ReactElement
}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const { reset, clear, children } = props
    const classes = useStylesExtends(useStyles(), props)
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
