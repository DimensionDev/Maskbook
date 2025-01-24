import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { SelectFungibleTokenModal, SelectNonFungibleContractModal, TokenIcon } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, RadioIndicator, ShadowRootPopper, ShadowRootTooltip } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { FungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { PopperOwnProps } from '@mui/base'
import { ClickAwayListener, InputBase, Typography } from '@mui/material'
import { useState, type HTMLProps } from 'react'
import { ConditionType, useRedPacket } from '../contexts/RedPacketContext.js'

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
            fontSize: 14,
            fontWeight: 700,
        },
        conditions: {
            backgroundColor: theme.palette.maskColor.bottom,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1.5),
        },
        condition: {
            width: '100%',
        },
        option: {
            display: 'flex',
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
            width: 400,
            backgroundColor: theme.palette.maskColor.bottom,
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
        assets: {
            display: 'flex',
            gap: '4px',
            flexFlow: 'row wrap',
        },
        collections: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
        },
        asset: {
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            gap: theme.spacing(1),
        },
        assetName: {
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '20px',
            color: theme.palette.maskColor.main,
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        tokenIcon: {
            width: 24,
            height: 24,
            marginRight: '0px !important',
        },
    }
})

const popperOptions: PopperOwnProps['popperOptions'] = {
    strategy: 'absolute',
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 10],
            },
        },
    ],
} as const

export function ConditionSettings(props: HTMLProps<HTMLDivElement>) {
    const { classes, cx, theme } = useStyles()
    const {
        conditions,
        setConditions,
        tokenQuantity,
        setTokenQuantity,
        requiredTokens,
        setRequiredTokens,
        requiredCollections,
        setRequiredCollections,
    } = useRedPacket()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return (
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <div {...props} className={cx(classes.container, props.className)}>
                <div className={classes.button}>
                    {conditions.length === 0 ?
                        <Trans>Everyone</Trans>
                    :   <Trans>{conditions.join('/')} Holder</Trans>}
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
                    popperOptions={popperOptions}
                    keepMounted>
                    <div className={classes.conditions}>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions(EMPTY_LIST)
                                }}>
                                <RadioIndicator
                                    checked={conditions.length === 0}
                                    uncheckedColor={theme.palette.maskColor.secondaryLine}
                                />
                                <Typography className={classes.rowLabel}>
                                    <Trans>Everyone</Trans>
                                </Typography>
                            </label>
                        </div>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions([ConditionType.Crypto])
                                }}>
                                <RadioIndicator
                                    checked={conditions.includes(ConditionType.Crypto)}
                                    uncheckedColor={theme.palette.maskColor.secondaryLine}
                                />
                                <Typography className={classes.rowLabel}>
                                    <Trans>Crypto Holder</Trans>
                                </Typography>
                            </label>
                            {conditions.includes(ConditionType.Crypto) ?
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
                                            maxlength: 16,
                                            max: 10000000000,
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
                                    {requiredTokens.length ?
                                        <div className={classes.assets}>
                                            {requiredTokens.map((token) => (
                                                <div className={classes.asset} key={token.address}>
                                                    <TokenIcon
                                                        className={classes.tokenIcon}
                                                        address={token.address}
                                                        name={token.name}
                                                        chainId={token.chainId}
                                                        logoURL={token.logoURL}
                                                        size={24}
                                                        badgeSize={12}
                                                    />
                                                    <Typography className={classes.assetName}>
                                                        {token.symbol}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    :   null}
                                    <Typography
                                        className={classes.selectButton}
                                        onClick={async () => {
                                            setAnchorEl(null)
                                            const picked = await SelectFungibleTokenModal.openAndWaitForClose({
                                                disableNativeToken: false,
                                                selectedTokens: requiredTokens,
                                                pluginID: NetworkPluginID.PLUGIN_EVM,
                                                chainId,
                                                multiple: true,
                                                maxTokens: 4,
                                            })
                                            if (picked) {
                                                setRequiredTokens(picked as Array<FungibleToken<ChainId, SchemaType>>)
                                            }
                                        }}>
                                        {requiredTokens.length ?
                                            <>
                                                <Trans>Adjust Selection</Trans>
                                                <Icons.Filter size={16} />
                                            </>
                                        :   <>
                                                <Trans>Select a token</Trans>
                                                <Icons.Plus size={16} />
                                            </>
                                        }
                                    </Typography>
                                </div>
                            :   null}
                        </div>
                        <div className={classes.condition}>
                            <label
                                className={classes.option}
                                onClick={() => {
                                    setConditions([ConditionType.NFT])
                                }}>
                                <RadioIndicator
                                    checked={conditions.includes(ConditionType.NFT)}
                                    uncheckedColor={theme.palette.maskColor.secondaryLine}
                                />
                                <Typography className={classes.rowLabel}>
                                    <Trans>NFT Holder</Trans>
                                </Typography>
                            </label>
                            {conditions.includes(ConditionType.NFT) ?
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
                                    {requiredCollections.length ?
                                        <div className={classes.collections}>
                                            {requiredCollections.map((collection) => (
                                                <div className={classes.asset} key={collection.address}>
                                                    <TokenIcon
                                                        className={classes.tokenIcon}
                                                        address={collection.address}
                                                        name={collection.name}
                                                        chainId={collection.chainId}
                                                        logoURL={collection.iconURL!}
                                                        size={36}
                                                        badgeSize={12}
                                                    />
                                                    <Typography className={classes.assetName}>
                                                        {collection.name}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    :   null}
                                    <Typography
                                        className={classes.selectButton}
                                        onClick={async () => {
                                            setAnchorEl(null)
                                            const picked = await new Promise<
                                                Array<NonFungibleCollection<ChainId, SchemaType>>
                                            >((resolve) => {
                                                SelectNonFungibleContractModal.open({
                                                    pluginID: NetworkPluginID.PLUGIN_EVM,
                                                    chainId,
                                                    multiple: true,
                                                    maxCollections: 4,
                                                    selectedCollections: requiredCollections,
                                                    onSubmit(collection) {
                                                        resolve(
                                                            collection as Array<
                                                                NonFungibleCollection<ChainId, SchemaType>
                                                            >,
                                                        )
                                                    },
                                                })
                                            })
                                            if (picked) {
                                                setRequiredCollections(picked)
                                            }
                                        }}>
                                        {requiredCollections.length ?
                                            <>
                                                <Trans>Adjust Selection</Trans>
                                                <Icons.Filter size={16} />
                                            </>
                                        :   <>
                                                <Trans>Select NFTs</Trans>
                                                <Icons.Plus size={16} />
                                            </>
                                        }
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
