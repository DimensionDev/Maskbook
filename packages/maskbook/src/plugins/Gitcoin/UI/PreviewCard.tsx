import { makeStyles, createStyles, Button } from '@material-ui/core'
import { useCallback } from 'react'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useGrant } from '../hooks/useGrant'
import { PluginGitcoinMessages } from '../messages'

const useStyles = makeStyles((theme) => createStyles({}))

interface PreviewCardProps {
    id: string
    onRequest(): void
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { value: grant, error, loading } = useGrant(props.id)

    //#region the donation dialog
    const [_, openDonationDialog] = useRemoteControlledDialog(PluginGitcoinMessages.events.donationDialogUpdated)
    const onDonate = useCallback(() => {
        if (!grant) return
        openDonationDialog({
            open: true,
            address: grant.admin_address,
            title: grant.title,
        })
    }, [grant, openDonationDialog])
    //#endregion

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>ERROR</h1>
    if (!grant) return null

    return (
        <div>
            <h1>{grant.title}</h1>
            <p>{grant.admin_address}</p>
            <Button onClick={onDonate}>Donate</Button>
        </div>
    )
}
