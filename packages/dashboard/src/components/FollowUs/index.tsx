import { styled, Typography, useTheme } from '@mui/material'
import { openWindow } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { useDashboardI18N } from '../../locales/index.js'

const FollowUsContainer = styled('div')(() => ({
    background: 'linear-gradient(90deg, #ACCBEE 0%, #E7F0FD 100%)',
    borderRadius: 12,
    fontSize: 16,
    lineHeight: '22px',
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: '0 27px',
    color: '#ffffff',
    cursor: 'pointer',
}))

const TwitterColoredContainer = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    padding: 9,
    borderRadius: 99,
    background: 'linear-gradient(90deg, rgba(253, 251, 251, 0.8) 0%, rgba(235, 237, 238, 0.8) 100%)',
}))

function openMaskNetwork() {
    return openWindow('https://twitter.com/realMaskNetwork')
}
export function FollowUs() {
    const t = useDashboardI18N()
    const theme = useTheme()

    return (
        <div style={{ padding: '0 16px', height: 80, marginBottom: 16 }} onClick={() => openMaskNetwork()}>
            <FollowUsContainer>
                <Typography>{t.follow_us()}</Typography>
                <TwitterColoredContainer>
                    <Icons.TwitterX variant="light" size={24} />
                </TwitterColoredContainer>
            </FollowUsContainer>
        </div>
    )
}
