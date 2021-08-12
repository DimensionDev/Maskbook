import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import classNames from 'classnames'
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
        padding: theme.spacing(1),
        fontWeight: 700,
        color: getMaskColor(theme).blue,
    },
    selected: {
        color: 'black',
    },
}))
export interface EnhancedProfileTabProps extends withClasses<'tab' | 'button' | 'selected'> {
    clear(): void
    reset(): void
    hot?: ReactElement
}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const { reset, clear, hot } = props
    const { classes } = useStyles()
    const styles = useStylesExtends(classes, props)
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
        <div key="nfts" className={styles.tab}>
            <div className={classNames(styles.button, active ? styles.selected : '')} onClick={onClick}>
                NFTs
                {active && hot ? hot : null}
            </div>
        </div>
    )
}
