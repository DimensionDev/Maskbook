import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, DialogContent } from '@material-ui/core'
import type { ERC721ContractDetailed } from '@masknet/web3-shared'
import { TokenCard } from './TokenCard'
import type { BoxInfo } from '../../type'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    main: {},
    list: {},
    token: {},
}))

export interface DrawResultDialogProps {
    open: boolean
    onClose: () => void
    boxInfo: BoxInfo
    contractDetailed?: ERC721ContractDetailed
}

export function DrawResultDialog(props: DrawResultDialogProps) {
    const { open, onClose, boxInfo, contractDetailed } = props
    const { classes } = useStyles()
    const onShare = useCallback(() => {}, [])

    return (
        <InjectedDialog title="Draw Succeed" open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.main}>
                    {contractDetailed ? (
                        <Box className={classes.list} display="flex" flexWrap="wrap">
                            {boxInfo.tokenIdsPurchased.map((x) => (
                                <Box className={classes.token} key={x} flex={1}>
                                    <TokenCard tokenId={x} contractDetailed={contractDetailed} />
                                </Box>
                            ))}
                        </Box>
                    ) : null}
                    <ActionButton size="medium" fullWidth variant="contained" onClick={onShare}>
                        Share
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
