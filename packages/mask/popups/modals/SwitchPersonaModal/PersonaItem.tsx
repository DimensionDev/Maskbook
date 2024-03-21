import { memo, useCallback } from 'react'
import { ListItem, listItemSecondaryActionClasses, type ListItemProps, Radio, Typography, Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { type PersonaInformation } from '@masknet/shared-base'
import { PersonaPublicKey } from '../../components/PersonaPublicKey/index.js'
import { PersonaAvatar } from '../../components/PersonaAvatar/index.js'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1),
        display: 'flex',
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
        [`& .${listItemSecondaryActionClasses.root}`]: {
            right: 0,
        },
    },
    avatar: {
        boxShadow: '0px 4px 12px 0px rgba(171, 185, 255, 0.20)',
        width: 36,
        height: 36,
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    icon: {
        color: theme.palette.maskColor.second,
    },
}))

interface PersonaItemProps extends Omit<ListItemProps, 'onSelect'> {
    persona: PersonaInformation
    isSelected: boolean
    onSelect: (persona: PersonaInformation) => void
}

export const PersonaItem = memo<PersonaItemProps>(function PersonaItem({ isSelected, onSelect, persona, ...rest }) {
    const { classes } = useStyles()
    const handleClick = useCallback(() => {
        onSelect(persona)
    }, [onSelect, persona])
    return (
        <ListItem
            className={classes.item}
            secondaryAction={<Radio checked={isSelected} />}
            onClick={handleClick}
            {...rest}>
            <PersonaAvatar
                avatar={persona.avatar}
                pubkey={persona.identifier.publicKeyAsHex}
                classes={{ root: classes.avatar }}
                size={36}
            />
            <Box ml={1}>
                <Typography className={classes.name}>{persona.nickname}</Typography>
                <PersonaPublicKey
                    rawPublicKey={persona.identifier.rawPublicKey}
                    publicHexString={persona.identifier.publicKeyAsHex}
                    iconSize={16}
                    classes={{ icon: classes.icon }}
                />
            </Box>
        </ListItem>
    )
})
