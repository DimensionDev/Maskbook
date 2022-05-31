import { EMPTY_LIST } from '@masknet/shared-base'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Chip, Stack, Typography } from '@mui/material'
import { ReactNode, useMemo, useState } from 'react'
import type { DefProfileProperty } from '../../types'
import { StatusBox } from '../components'
import { useDefProfile } from '../hooks/useDefProfile'
import { usePoapActions } from '../hooks/usePoapActions'

export interface ProfilePageProps {
    loading?: boolean
    address: string
}

interface AccordionProps {
    address: string
}

const AccordionLayout = ({
    loading,
    children,
    empty,
    summary,
}: {
    summary: ReactNode
    loading: boolean
    children: ReactNode
    empty: boolean
}) => {
    const [expanded, setExpaned] = useState(true)
    return (
        <Accordion
            expanded={expanded}
            onChange={() => {
                setExpaned(!expanded)
            }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="poap-actions-content"
                id="poap-actions-header">
                {summary}
            </AccordionSummary>
            <AccordionDetails>
                {(loading || empty) && <StatusBox loading={loading} empty={empty} />}
                {children}
            </AccordionDetails>
        </Accordion>
    )
}

const POAPActionsAccordion = ({ address }: AccordionProps) => {
    const { value: actions = EMPTY_LIST, loading } = usePoapActions(address)

    return (
        <AccordionLayout
            summary={
                <>
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>POAP Actions</Typography>
                </>
            }
            loading={loading}
            empty={actions.length === 0}>
            {actions.map((action) => {
                return (
                    <Stack direction="row" key={action.tokenId} mb={2}>
                        <Box mt={1}>
                            <Avatar alt={action.event.name} src={action.event.image_url} />
                        </Box>
                        <Stack ml={2}>
                            <Typography variant="h6">{action.event.name}</Typography>
                            <Typography variant="body1">{action.event.description}</Typography>
                        </Stack>
                    </Stack>
                )
            })}
        </AccordionLayout>
    )
}

const DefProfileAccordion = ({ address }: AccordionProps) => {
    const { value: profile = undefined, loading } = useDefProfile(address)
    const properties = profile?.defProperties ?? EMPTY_LIST
    const credentials = profile?.galaxyCredentials ?? EMPTY_LIST
    const groupedProperties = useMemo(
        () =>
            // eslint-disable-next-line unicorn/no-array-reduce
            properties.reduce<{ [key: string]: DefProfileProperty[] }>((acc, property) => {
                const key = property.prop
                if (!acc[key]) {
                    acc[key] = []
                }
                acc[key].push(property)
                return acc
            }, {}),
        [profile],
    )

    return (
        <>
            <AccordionLayout
                summary={
                    <>
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Galaxy Credentials</Typography>
                    </>
                }
                loading={loading}
                empty={credentials.length === 0}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={1}>
                    {credentials.map((credential) => {
                        return <Chip key={credential.id} label={credential.name} />
                    })}
                </Stack>
            </AccordionLayout>
            <AccordionLayout
                summary={
                    <>
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Def Properties</Typography>
                    </>
                }
                loading={loading}
                empty={properties.length === 0}>
                <Stack spacing={0.5} gap={1}>
                    {Object.keys(groupedProperties).map((key) => {
                        return (
                            <Stack key={key} direction="row" spacing={0.5} gap={1}>
                                <Box mt={0.5} flexShrink={0} width={150} overflow="hidden" textOverflow="ellipsis">
                                    {key}:
                                </Box>
                                <Stack key={key} direction="row" spacing={0.5} flexWrap="wrap" gap={1}>
                                    {groupedProperties[key].map((property) => (
                                        <Chip key={property.value} label={property.value} />
                                    ))}
                                </Stack>
                            </Stack>
                        )
                    })}
                </Stack>
            </AccordionLayout>
        </>
    )
}

export function ProfilePage({ address }: ProfilePageProps) {
    return (
        <>
            <section className="grid items-center justify-start grid-cols-1 gap-2 py-4">
                <POAPActionsAccordion address={address} />
                <DefProfileAccordion address={address} />
            </section>
        </>
    )
}
