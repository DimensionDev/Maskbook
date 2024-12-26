import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { CheckBoxIndicator, makeStyles, RadioIndicator, ShadowRootPopper, ShadowRootTooltip } from '@masknet/theme'
import { ClickAwayListener, InputBase, Typography } from '@mui/material'
import { useState, type HTMLProps } from 'react'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { SelectFungibleTokenModal } from '@masknet/shared'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
        container: {
            display: 'flex',
            gap: theme.spacing(0.5),
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 99,
            height: 26,
            cursor: 'pointer',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            marginLeft: 6,
            padding: theme.spacing(0.5, 1.5),
            boxSizing: 'border-box',
        },
        conditions: {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1.5),
        },
        condition: {
            width: '100%',
        },
        option: {
            display: 'flex',
            width: '100%',
            padding: theme.spacing(0.5),
            cursor: 'pointer',
        },
        rowLabel: {
            marginLeft: 'auto',
            fontWeight: 700,
            fontSize: 16,
        },
        popper: {
            position: 'absolute',
            zIndex: 1400,
            isolate: 'isolate',
            borderRadius: 16,
            padding: theme.spacing(1.5),
            width: 278,
            backgroundColor: theme.palette.background.paper,
            boxShadow:
                theme.palette.mode === 'light' ?
                    '0px 4px 30px rgba(0, 0, 0, 0.1)'
                :   '0px 4px 30px rgba(255, 255, 255, 0.15)',
        },
        section: {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
        },
        sectionTitle: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.maskColor.second,
            fontSize: 14,
            fontWeight: 700,
            gap: theme.spacing(0.5),
        },
        selectButton: {
            display: 'inline-flex',
            gap: 4,
            backgroundColor: theme.palette.maskColor.main,
            color: theme.palette.maskColor.bottom,
            padding: theme.spacing(0.5, 1),
            borderRadius: 99,
            cursor: 'pointer',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 700,
            alignSelf: 'flex-start',
        },
    }
})

export function ConditionSettings(props: HTMLProps<HTMLDivElement>) {
    const { classes, cx } = useStyles()
    const { conditions, setConditions, tokenQuantity, setTokenQuantity, requiredTokens, setRequiredTokens } =
        useRedPacket()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()

    return (
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <div {...props} className={cx(classes.container, props.className)}>
                <div className={classes.button}>
                    {conditions.length === 0 ?
                        <Trans>Everyone</Trans>
                    :   <Trans>{conditions.join('/')} holder</Trans>}
                </div>
                <Icons.ArrowDrop
                    onClick={(event) => {
                        setAnchorEl(anchorEl ? null : event.currentTarget)
                    }}
                />
                <ShadowRootPopper
                    className={classes.popper}
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    placement="bottom-end"
                    popperOptions={{
                        strategy: 'absolute',
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, 10],
                                },
                            },
                        ],
                    }}
                    keepMounted>
                    <div className={classes.conditions}>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions(EMPTY_LIST)
                                }}>
                                <RadioIndicator checked={conditions.length === 0} />
                                <Typography className={classes.rowLabel}>
                                    <Trans>Everyone</Trans>
                                </Typography>
                            </label>
                        </div>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions(
                                        conditions.includes('token') ?
                                            conditions.filter((c) => c !== 'token')
                                        :   [...conditions, 'token'],
                                    )
                                }}>
                                <CheckBoxIndicator checked={conditions.includes('token')} />
                                <Typography className={classes.rowLabel}>
                                    <Trans>Crypto Holder</Trans>
                                </Typography>
                            </label>
                            {conditions.includes('token') ?
                                <div className={classes.section}>
                                    <Typography className={classes.sectionTitle}>
                                        <Trans>Token quantity greater than</Trans>
                                        <ShadowRootTooltip
                                            title={
                                                <Trans>
                                                    Leave blank to allow any amount; enter a number to set a minimum
                                                    holding requirement.
                                                </Trans>
                                            }>
                                            <Icons.Questions sx={{ ml: 0.5 }} />
                                        </ShadowRootTooltip>
                                    </Typography>
                                    <InputBase
                                        value={tokenQuantity}
                                        placeholder="0.0"
                                        onChange={(e) => {
                                            const value = e.currentTarget.value.trim()
                                            setTokenQuantity(value)
                                        }}
                                        inputProps={{
                                            autoComplete: 'off',
                                            autoCorrect: 'off',
                                            inputMode: 'decimal',
                                            spellCheck: false,
                                        }}
                                    />
                                    <Typography>
                                        <Trans>Supported contracts</Trans>
                                        <ShadowRootTooltip
                                            title={
                                                <Trans>
                                                    You can claim the lucky drop by holding the required amount of any
                                                    selected token.
                                                </Trans>
                                            }>
                                            <Icons.Questions sx={{ ml: 0.5 }} />
                                        </ShadowRootTooltip>
                                    </Typography>
                                    <Typography
                                        className={classes.selectButton}
                                        onClick={async () => {
                                            setAnchorEl(null)
                                            const picked = await SelectFungibleTokenModal.openAndWaitForClose({
                                                disableNativeToken: false,
                                                selectedTokens: requiredTokens,
                                                pluginID: NetworkPluginID.PLUGIN_EVM,
                                                multiple: true,
                                            })
                                            setRequiredTokens(picked as Array<FungibleToken<ChainId, SchemaType>>)
                                        }}>
                                        <Trans>Select a token</Trans>
                                        <Icons.Plus size={16} />
                                    </Typography>
                                </div>
                            :   null}
                        </div>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions(
                                        conditions.includes('nft') ?
                                            conditions.filter((c) => c !== 'nft')
                                        :   [...conditions, 'nft'],
                                    )
                                }}>
                                <CheckBoxIndicator checked={conditions.includes('nft')} />
                                <Typography className={classes.rowLabel}>
                                    <Trans>NFT Holder</Trans>
                                </Typography>
                            </label>
                            {conditions.includes('nft') ?
                                <div className={classes.section}>
                                    <Typography className={classes.sectionTitle}>
                                        <Trans>Supported contracts</Trans>
                                        <ShadowRootTooltip
                                            title={
                                                <Trans>
                                                    You can claim the lucky drop by holding the required amount of any
                                                    selected token.
                                                </Trans>
                                            }>
                                            <Icons.Questions sx={{ ml: 0.5 }} />
                                        </ShadowRootTooltip>
                                    </Typography>
                                    <Typography className={classes.selectButton}>
                                        <Trans>Select a token</Trans>
                                    </Typography>
                                </div>
                            :   null}
                        </div>
                    </div>
                </ShadowRootPopper>
            </div>
        </ClickAwayListener>
    )
}
