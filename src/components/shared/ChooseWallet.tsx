import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { List, Accordion, AccordionSummary } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import type { WalletRecord } from '../../plugins/Wallet/database/types'
import { WalletInListProps, WalletInList } from './SelectWallet/WalletInList'
import { isSameAddr } from '../../plugins/Wallet/token'
import Services from '../../extension/service'

const useStyles = makeStyles({
    root: {
        width: '100%',
        lineHeight: 1.75,
    },
    expansionPanelRoot: {
        boxShadow: 'none',
        width: '100%',
    },
    list: {
        width: '100%',
        padding: 0,
    },
    listItemRoot: {
        padding: '6px 24px 6px 8px',
    },
    fingerprint: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 12,
    },
})

const useAccordionSummaryStyle = makeStyles({
    root: {
        padding: 0,
    },
    content: {
        width: '100%',
        margin: 0,
    },
    expanded: {
        margin: '0 !important',
        minHeight: 'unset !important',
    },
    expandIcon: {
        padding: 0,
        marginRight: '0 !important',
        right: 4,
        position: 'absolute',
        pointerEvents: 'none',
    },
})

export interface ChooseWalletProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallets: WalletRecord[]
    onChange?: (wallet: WalletRecord) => void
    WalletInListProps?: Partial<WalletInListProps>
}

export function ChooseWallet(props: ChooseWalletProps) {
    const { wallets } = props
    const classes = useStylesExtends(useStyles(), props)
    const expansionPanelSummaryClasses = useStylesExtends(useAccordionSummaryStyle(), props)

    const [expanded, setExpanded] = useState(false)
    const current = wallets.find((x) => x._wallet_is_default) ?? wallets[0]

    const onChange = useCallback(() => {
        if (wallets.length > 1) setExpanded(!expanded)
    }, [wallets.length, expanded])

    if (!current) return null
    return (
        <div className={classes.root}>
            <Accordion classes={{ root: classes.expansionPanelRoot }} expanded={expanded} onChange={onChange}>
                <AccordionSummary
                    classes={expansionPanelSummaryClasses}
                    expandIcon={wallets.length > 1 ? <ExpandMoreIcon /> : null}>
                    <WalletInList
                        item={current}
                        ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                        {...props.WalletInListProps}
                    />
                </AccordionSummary>
                {wallets.length ? (
                    <List classes={{ root: classes.list }}>
                        {wallets.map((wallet) =>
                            isSameAddr(current.address, wallet.address) ? null : (
                                <WalletInList
                                    ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                                    item={wallet}
                                    key={wallet.address}
                                    onClick={() => {
                                        setExpanded(false)
                                        Services.Plugin.invokePlugin(
                                            'maskbook.wallet',
                                            'setDefaultWallet',
                                            wallet.address,
                                        )
                                    }}
                                    {...props.WalletInListProps}
                                />
                            ),
                        )}
                    </List>
                ) : null}
            </Accordion>
        </div>
    )
}
