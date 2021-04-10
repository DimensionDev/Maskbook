import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import { Button, Box, Typography, Select, MenuItem, FormControl, CircularProgress } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { init, changeMediaDevice, disconnectVoice, setMuted, registerSpeakingUsernames } from '../utils/voicechat'
import type { PeerMediaElement, VoiceChatMetadata } from '../types'
import { VolumeUpOutlined, VolumeMuteOutlined, VolumeOffOutlined, CloseOutlined } from '@material-ui/icons'
import { useState } from 'react'
import { usePortalShadowRoot } from '../../../utils/shadow-root/usePortalShadowRoot'

interface VoicechatInlayProps {
    metadata: VoiceChatMetadata
}

interface ChannelUsersProps {
    peerMediaElements: Record<string, PeerMediaElement> | undefined
    localPeerMediaElement: PeerMediaElement | undefined | null
}

interface JoinButtonProps {
    localPeerMediaElement: PeerMediaElement | undefined | null
    joinChat(): void
    isJoining: boolean
}

interface MediaSelectionProps {
    activeMediaDevice: string
    localPeerMediaElement: PeerMediaElement | undefined | null
    mediaDevices: MediaDeviceInfo[]
}

interface MuteSwitchProps {
    isMuted: boolean
    setIsMuted(b: boolean): void
    setMuted(b: boolean): void
}

interface DisconnectButtonProps {
    setIsMuted(b: boolean): void
    disconnectVoice(): void
}

interface SettingsProps {
    localPeerMediaElement: PeerMediaElement | undefined | null
    activeMediaDevice: string
    mediaDevices: MediaDeviceInfo[]
    isMuted: boolean
    setIsMuted(b: boolean): void
    setMuted(b: boolean): void
    disconnectVoice(): void
}

function ChannelUsers(props: ChannelUsersProps) {
    const { t } = useI18N()

    let elements: PeerMediaElement[] = []

    const [speakingUsernames, setSpeakingUsernames] = useState<string[]>([])

    registerSpeakingUsernames((speakingUsernames: string[]) => setSpeakingUsernames(speakingUsernames))

    if (props.peerMediaElements) {
        const peerMediaElements = props.peerMediaElements
        elements = Object.keys(peerMediaElements).map((peerMediaKey) => peerMediaElements[peerMediaKey])
    }
    if (props.localPeerMediaElement) {
        elements.push(props.localPeerMediaElement)
    }

    return (
        <div>
            {elements.map((peerMedia) => {
                const isSpeaking = speakingUsernames.includes(peerMedia.username)
                const SpeakIcon = () => (isSpeaking ? <VolumeUpOutlined /> : <VolumeMuteOutlined />)

                return (
                    <Box key={peerMedia.username + peerMedia.isLocal} display={'flex'} alignItems={'center'}>
                        <Box marginRight={0.5} style={{ marginTop: '6px' }}>
                            <SpeakIcon />
                        </Box>
                        <Typography component="p" sx={{ fontWeight: isSpeaking ? 'bold' : 'regular' }}>
                            {peerMedia.isLocal ? t('plugin_voicechat_you') : peerMedia.username}
                        </Typography>
                    </Box>
                )
            })}
        </div>
    )
}

function JoinButton(props: JoinButtonProps) {
    const { t } = useI18N()

    return props.localPeerMediaElement ? null : (
        <Button
            color="primary"
            variant="contained"
            style={{ color: '#fff' }}
            onClick={() => props.joinChat()}
            startIcon={props.isJoining ? <CircularProgress style={{ color: 'white' }} size={24} /> : null}>
            {t('plugin_voicechat_join_conversation')}
        </Button>
    )
}

function MediaSelection(props: MediaSelectionProps) {
    return usePortalShadowRoot((container) => (
        <FormControl>
            <Select
                value={props.activeMediaDevice}
                MenuProps={{ container }}
                onChange={(e) => {
                    if (props.localPeerMediaElement) {
                        changeMediaDevice(e.target.value, props.localPeerMediaElement.username)
                    }
                }}>
                {props.mediaDevices.map((device) => (
                    <MenuItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    ))
}

function MuteSwitch(props: MuteSwitchProps) {
    return (
        <Button
            onClick={() => {
                props.setMuted(!props.isMuted)
                props.setIsMuted(!props.isMuted)
            }}
            variant="outlined"
            style={{ minHeight: '33px', minWidth: '20px' }}>
            {props.isMuted ? <VolumeOffOutlined fontSize={'small'} /> : <VolumeUpOutlined fontSize={'small'} />}
        </Button>
    )
}

function DisconnectButton(props: DisconnectButtonProps) {
    return (
        <Button
            onClick={() => {
                props.disconnectVoice()
                props.setIsMuted(false)
            }}
            variant="outlined"
            style={{ minHeight: '33px', minWidth: '20px', marginLeft: '5px' }}
            color="secondary">
            <CloseOutlined fontSize={'small'} />
        </Button>
    )
}

function Settings(props: SettingsProps) {
    const {
        mediaDevices,
        activeMediaDevice,
        localPeerMediaElement,
        isMuted,
        setIsMuted,
        setMuted,
        disconnectVoice,
    } = props

    return localPeerMediaElement ? (
        <Box
            paddingX={2}
            paddingY={1}
            bgcolor={'#eee'}
            borderTop={1}
            borderColor={'#ccc'}
            display={'flex'}
            justifyContent={'space-between'}>
            <MediaSelection {...{ mediaDevices, activeMediaDevice, localPeerMediaElement }} />
            <Box display={'flex'}>
                <MuteSwitch {...{ isMuted, setIsMuted, setMuted }} />
                <DisconnectButton {...{ setIsMuted, disconnectVoice }} />
            </Box>
        </Box>
    ) : null
}

export function VoicechatInlay(props: VoicechatInlayProps) {
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const postBy = usePostInfoDetails('postBy')

    const [peerMediaElements, setPeerMediaElements] = useState<Record<string, PeerMediaElement>>()
    const [localPeerMediaElement, setLocalPeerMediaElement] = useState<PeerMediaElement | null>()
    const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([])
    const [activeMediaDevice, setActiveMediaDevice] = useState<string>('')
    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [isJoining, setIsJoining] = useState<boolean>(false)

    const { t } = useI18N()

    if (!postIdentifier) {
        return null
    }

    const joinChat = () => {
        setIsJoining(true)

        navigator.mediaDevices.enumerateDevices().then((devices) => {
            setMediaDevices([...devices.filter((d) => d.kind === 'audioinput')])
        })

        const customServer = props.metadata.customServer ? props.metadata.customServer : ''

        init(
            customServer,
            postIdentifier.postId,
            postBy.userId,
            (peerMedia, localPeer) => {
                setPeerMediaElements({ ...peerMedia })
                setLocalPeerMediaElement(localPeer)
                setIsJoining(false)
            },
            (activeMediaDevice: string) => {
                setActiveMediaDevice(activeMediaDevice)
            },
        )
    }

    return (
        <div>
            <MaskbookPluginWrapper pluginName="Voicechat">
                <Box
                    borderRadius={0.5}
                    bgcolor={'#fff'}
                    border={1}
                    borderColor={'rgb(196, 207, 214)'}
                    overflow={'hidden'}>
                    <Box padding={2}>
                        <ChannelUsers {...{ peerMediaElements, localPeerMediaElement }} />
                        <JoinButton {...{ joinChat, isJoining, localPeerMediaElement }} />
                    </Box>
                    <Settings
                        {...{
                            localPeerMediaElement,
                            activeMediaDevice,
                            mediaDevices,
                            isMuted,
                            setIsMuted,
                            setMuted,
                            disconnectVoice,
                        }}
                    />
                </Box>
            </MaskbookPluginWrapper>
        </div>
    )
}
