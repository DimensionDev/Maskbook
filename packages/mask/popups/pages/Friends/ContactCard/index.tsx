import { memo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEverSeen } from '@masknet/shared-base-ui'
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { Box, Typography, Avatar, useTheme, ButtonBase as Button } from '@mui/material'
import { formatPersonaFingerprint, PopupRoutes } from '@masknet/shared-base'
import { PersonaContext } from '@masknet/shared'
import Services from '#services'
import type { Friend } from '../../../hooks/index.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: theme.vars.palette.maskColor.line,
    },
    title: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        background: theme.vars.palette.maskColor.modalTitleBg,
    },
    avatar: {
        width: 40,
        height: 40,
    },
}))

interface ContactCardProps {
    friend: Friend
    avatar?: string
    refetch?: () => void
}

export const ContactCard = memo<ContactCardProps>(function ContactCard({ friend, avatar, refetch }) {
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { showSnackbar } = usePopupCustomSnackbar()
    const [local, setLocal] = useState(false)
    const [seen, ref] = useEverSeen<HTMLLIElement>()
    const { currentPersona } = PersonaContext.useContainer()
    const publicKey = friend.persona.publicKeyAsHex
    const rawPublicKey = currentPersona?.identifier.rawPublicKey
    const queryClient = useQueryClient()

    const handleAddFriend = useCallback(async () => {
        if (!currentPersona) return
        await Services.Identity.createNewRelation(friend.persona, currentPersona.identifier)
    }, [friend.persona, currentPersona])

    const { mutate: onAdd, isPending } = useMutation({
        mutationFn: handleAddFriend,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['relation-records', rawPublicKey] })
            await queryClient.cancelQueries({ queryKey: ['friends', rawPublicKey] })
            queryClient.setQueryData(
                ['friends', rawPublicKey],
                (
                    oldData:
                        | InfiniteData<{
                              friends: Friend[]
                              nextPageOffset: number
                          }>
                        | undefined,
                ) => {
                    if (!oldData) return
                    return {
                        ...oldData,
                        pages:
                            oldData.pages[0] ?
                                [
                                    { friends: [friend, ...oldData.pages[0].friends], nextPageOffset: 10 },
                                    ...oldData.pages.slice(1),
                                ]
                            :   [{ friends: [friend], nextPageOffset: 0 }],
                    }
                },
            )
            showSnackbar(<Trans>Added successfully</Trans>, { variant: 'success' })
            setLocal(true)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['relation-records', rawPublicKey] })
            await queryClient.invalidateQueries({ queryKey: ['friends', rawPublicKey] })
            refetch?.()
        },
    })

    return (
        <Box className={classes.card} ref={ref}>
            <Box className={classes.titleWrap}>
                <Box className={classes.title}>
                    {avatar ?
                        <Avatar className={classes.avatar} src={avatar} />
                    :   <Icons.MaskBlue className={classes.avatar} />}
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>
                            {publicKey ? formatPersonaFingerprint(publicKey) : null}
                        </Typography>
                    </Box>
                </Box>
                {local ?
                    <Button
                        onClick={() =>
                            navigate(`${PopupRoutes.FriendsDetail}/${publicKey}`, {
                                state: {
                                    avatar,
                                    friend,
                                },
                            })
                        }
                        color="inherit"
                        style={{ borderRadius: '50%' }}>
                        <Icons.ArrowRight />
                    </Button>
                :   <ActionButton
                        variant="roundedContained"
                        onClick={() => onAdd()}
                        loading={isPending}
                        disabled={isPending}>
                        <Trans>Add</Trans>
                    </ActionButton>
                }
            </Box>
        </Box>
    )
})
ContactCard.displayName = 'ContactCard'
