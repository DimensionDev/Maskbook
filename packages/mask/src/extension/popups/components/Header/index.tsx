// import { makeStyles } from '@masknet/theme'
// import { memo, useMemo } from 'react'
// import { Avatar, Box, Link, Typography } from '@mui/material'
// import { useLocation, useMatch, useNavigate } from 'react-router-dom'
// import {ECKeyIdentifier, formatPersonaFingerprint, Identifier, PopupRoutes} from '@masknet/shared-base'
// import { ArrowDropIcon, MaskBlueIcon, MaskNotSquareIcon, MasksIcon, PopupLinkIcon, SquareBack } from '@masknet/icons'
// import { i18n } from '../../../../../shared-ui/locales_legacy'
// import { useAsync } from 'react-use'
// import Services from '../../../service'
// import { currentPersonaIdentifier } from '../../../../settings/settings'
// import { useValueRef } from '@masknet/shared-base-ui'
// import { head } from 'lodash-unified'
// import { FormattedAddress } from '@masknet/shared'
// import { CopyIconButton } from '../CopyIconButton'
// import { useWallet } from '@masknet/plugin-infra'
// import {
//     EthereumRpcType,
//     formatEthereumAddress,
//     resolveAddressLinkOnExplorer,
//     useChainId,
// } from '@masknet/web3-shared-evm'
// import { useUnconfirmedRequest } from '../../pages/Wallet/hooks/useUnConfirmedRequest'
// import { useI18N } from '../../../../utils'
//
// const useStyles = makeStyles()(() => ({
//     container: {
//         background:
//             'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
//         padding: 16,
//         lineHeight: 0,
//         display: 'flex',
//         alignItems: 'center',
//         position: 'relative',
//     },
//     logo: {
//         width: 104,
//         height: 30,
//     },
//     back: {
//         fill: 'none',
//         position: 'absolute',
//         left: 16,
//         top: 16,
//     },
//     title: {},
//     action: {
//         background: 'rgba(255, 255, 255, 0.8)',
//         borderRadius: 99,
//         padding: '5px 8px 5px 4px',
//         display: 'flex',
//         alignItems: 'center',
//         cursor: 'pointer',
//     },
//     avatar: {
//         marginRight: 4,
//         width: 30,
//         height: 30,
//     },
//     nickname: {
//         color: '#07101B',
//         fontSize: 14,
//         lineHeight: '18px',
//         fontWeight: 700,
//     },
//     identifier: {
//         fontSize: 10,
//         color: '#767F8D',
//         lineHeight: 1,
//         display: 'flex',
//         alignItems: 'center',
//     },
//     icon: {
//         fontSize: 12,
//         fill: '#767F8D',
//         cursor: 'pointer',
//         marginLeft: 4,
//     },
//     arrow: {
//         fontSize: 20,
//         transition: 'all 300ms',
//     },
// }))
//
// const pageTitleMapper: Partial<Record<PopupRoutes, string>> = {
//     [PopupRoutes.AddDeriveWallet]: i18n.t('popups_add_derive'),
//     [PopupRoutes.WalletSettings]: i18n.t('popups_account_details'),
//     [PopupRoutes.WalletRename]: i18n.t('popups_rename'),
//     [PopupRoutes.DeleteWallet]: i18n.t('popups_delete_wallet'),
//     [PopupRoutes.CreateWallet]: i18n.t('popups_create_wallet'),
//     [PopupRoutes.WalletRecovered]: i18n.t('popups_recovery_wallet'),
//     [PopupRoutes.LegacyWalletRecovered]: i18n.t('popups_recovery_wallet'),
//     [PopupRoutes.BackupWallet]: i18n.t('popups_back_up_the_wallet'),
//     [PopupRoutes.AddToken]: i18n.t('add_token'),
//     [PopupRoutes.GasSetting]: i18n.t('popups_gas_fee_settings'),
//     [PopupRoutes.TokenDetail]: i18n.t('popups_assets'),
//     [PopupRoutes.ContractInteraction]: i18n.t('popups_contract_interaction'),
//     [PopupRoutes.Transfer]: i18n.t('popups_send'),
//     [PopupRoutes.SetPaymentPassword]: i18n.t('popups_set_the_payment_password'),
//     [PopupRoutes.Logout]: i18n.t('popups_log_out'),
//     [PopupRoutes.PersonaRename]: i18n.t('popups_rename'),
// } as const
//
// export const PopupHeader = memo(() => {
//     const { classes } = useStyles()
//     const { t } = useI18N()
//     const chainId = useChainId()
//     const navigate = useNavigate()
//     const location = useLocation()
//     const wallet = useWallet()
//     const currentIdentifier = useValueRef(currentPersonaIdentifier)
//     const matchPersona = useMatch(PopupRoutes.Personas)
//     const matchWallet = useMatch(PopupRoutes.Wallet)
//     const matchSelectPersona = useMatch(PopupRoutes.SelectPersona)
//     const matchSwitchWallet = useMatch(PopupRoutes.SwitchWallet)
//     const matchContractInteraction = useMatch(PopupRoutes.ContractInteraction)
//
//     const { value: request } = useUnconfirmedRequest()
//
//     const excludePath = [
//         matchPersona,
//         matchSelectPersona,
//         matchWallet,
//         matchSwitchWallet,
//         useMatch(PopupRoutes.SelectWallet),
//         useMatch(PopupRoutes.Unlock),
//     ].some(Boolean)
//
//     const { value: avatar } = useAsync(Services.Identity.getCurrentPersonaAvatar, [currentIdentifier])
//     const { value: currentPersona } = useAsync(async () => {
//         const personas = await Services.Identity.queryOwnedPersonaInformation()
//         if (!personas || personas.length < 1) return null
//
//         return personas.find((x) =>
//             x.identifier.equals(
//                 Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
//             ),
//         )
//     }, [currentIdentifier])
//
//     const interactionType = useMemo(() => {
//         const type = request?.computedPayload?.type
//         if (!type || !matchContractInteraction) return null
//
//         switch (type) {
//             case EthereumRpcType.CONTRACT_INTERACTION:
//                 switch (request.computedPayload.name) {
//                     case 'approve':
//                         return t('popups_wallet_token_unlock_permission')
//                     case 'transfer':
//                     case 'transferFrom':
//                         return t('popups_wallet_contract_interaction_transfer')
//                     default:
//                         return t('popups_wallet_contract_interaction')
//                 }
//             case EthereumRpcType.SEND_ETHER:
//                 return t('wallet_transfer_send')
//             default:
//                 return null
//         }
//     }, [request, matchContractInteraction, t])
//
//     if (!excludePath && history.length !== 1)
//         return (
//             <Box className={classes.container} style={{ justifyContent: 'center' }}>
//                 <SquareBack className={classes.back} onClick={() => navigate(-1)} />
//                 <Typography className={classes.title}>
//                     {interactionType ?? pageTitleMapper[location.pathname as PopupRoutes]}
//                 </Typography>
//             </Box>
//         )
//
//     return (
//         <Box className={classes.container} style={{ justifyContent: 'space-between' }}>
//             <MaskNotSquareIcon className={classes.logo} />
//             {(matchPersona || matchSelectPersona) && currentPersona ? (
//                 <div
//                     className={classes.action}
//                     onClick={() => navigate(matchSelectPersona ? PopupRoutes.Personas : PopupRoutes.SelectPersona)}>
//                     {avatar ? (
//                         <Avatar src={avatar} className={classes.avatar} />
//                     ) : (
//                         <MasksIcon className={classes.avatar} />
//                     )}
//                     <div>
//                         <Typography className={classes.nickname}>{currentPersona.nickname}</Typography>
//                         <Typography className={classes.identifier}>
//                             {formatPersonaFingerprint(currentIdentifier ?? '', 4)}
//                             <CopyIconButton text={currentIdentifier} className={classes.icon} />
//                         </Typography>
//                     </div>
//                     <ArrowDropIcon
//                         className={classes.arrow}
//                         style={{ transform: matchSelectPersona ? 'rotate(-180deg)' : undefined }}
//                     />
//                 </div>
//             ) : (matchWallet || matchSwitchWallet) && wallet ? (
//                 <div
//                     className={classes.action}
//                     onClick={() => navigate(matchSwitchWallet ? PopupRoutes.Wallet : PopupRoutes.SwitchWallet)}>
//                     <MaskBlueIcon className={classes.avatar} />
//                     <div>
//                         <Typography className={classes.nickname}>{wallet.name}</Typography>
//                         <Typography className={classes.identifier}>
//                             <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
//                             <CopyIconButton text={currentIdentifier} className={classes.icon} />
//                             <Link
//                                 style={{ width: 12, height: 12 }}
//                                 href={resolveAddressLinkOnExplorer(chainId, wallet?.address ?? '')}
//                                 target="_blank"
//                                 rel="noopener noreferrer">
//                                 <PopupLinkIcon className={classes.icon} />
//                             </Link>
//                         </Typography>
//                     </div>
//                     <ArrowDropIcon
//                         className={classes.arrow}
//                         style={{ transform: matchSwitchWallet ? 'rotate(-180deg)' : undefined }}
//                     />
//                 </div>
//             ) : null}
//         </Box>
//     )
// })
export { WalletHeader } from './WalletHeader'
export { PersonaHeader } from './PersonaHeader'
export { NormalHeader} from './NormalHeader'
