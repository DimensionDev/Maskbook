import { makeStyles } from '@masknet/theme'
import { Fragment, memo } from 'react'
import { Box, Link, Typography } from '@mui/material'
import type { EIP4361Message, ParsedEIP4361Message } from '@masknet/web3-shared-base'
import { useInteractionWalletContext } from '../../pages/Wallet/Interaction/InteractionContext.js'
import { TypedMessageTextRender } from '../../../../typed-message/react/src/Renderer/Core/Text.js'
import { Alert } from '@masknet/shared'
import { RenderFragmentsContext, type RenderFragmentsContextType } from '@masknet/typed-message-react'
import { RenderEIP712 } from './eip712.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
    },
    source: {
        padding: theme.spacing(1.25),
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.25),
        borderRadius: 8,
    },
    sourceText: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    },
    messageTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: theme.spacing(3),
    },
    dangerField: {
        color: theme.palette.error.main,
    },
}))

interface SignRequestInfoProps {
    message: string | EIP4361Message | undefined
    rawMessage: string | object | undefined
    origin: string | undefined
}

// TODO: render typed sign
export const SignRequestInfo = memo<SignRequestInfoProps>(({ message, rawMessage, origin }) => {
    const { classes, cx } = useStyles()

    const isEIP4361 = typeof message === 'object' && message.type === 'eip4361'
    const isEIP712 = typeof rawMessage === 'object'

    let EIP4361Message
    let TextMessage
    if (isEIP4361) {
        TextMessage = message.message
        if (message.parsed) {
            if (!origin) throw new Error('EIP4361 message must have an origin')
            EIP4361Message = (
                <EIP4361Render invalidFields={message.invalidFields} message={message.parsed} messageOrigin={origin} />
            )
        } else {
            EIP4361Message = (
                <Alert className={classes.dangerField} open>
                    <Trans>
                        This message contains a invalid EIP-4361 message. It is better to reject this request.
                    </Trans>
                </Alert>
            )
        }
    }
    if (!TextMessage && typeof message === 'string') TextMessage = message
    if (!TextMessage && typeof rawMessage === 'string') TextMessage = rawMessage

    return (
        <main className={classes.container}>
            <Typography className={classes.title}>
                {isEIP4361 ?
                    <Trans>Sign-in Request</Trans>
                :   <Trans>Signature Request</Trans>}
            </Typography>
            {origin ?
                <Box className={classes.source}>
                    <Typography fontSize={16} fontWeight={700}>
                        <Trans>Request Source</Trans>
                    </Typography>
                    <Typography
                        className={cx(
                            classes.sourceText,
                            origin.startsWith('https://') ? undefined : classes.dangerField,
                        )}>
                        {origin}
                    </Typography>
                    {!origin.startsWith('https://') ?
                        <Alert className={classes.dangerField} open>
                            <Trans>
                                Your connection to this site is not encrypted which can be modified by a hostile third
                                party, we strongly suggest you reject this request.
                            </Trans>
                        </Alert>
                    :   null}
                </Box>
            :   null}
            {EIP4361Message}
            {typeof TextMessage === 'string' ?
                <>
                    <Typography className={classes.messageTitle}>
                        <Trans>Signing Message (Text)</Trans>
                    </Typography>
                    <Typography className={classes.sourceText} component={isEIP4361 ? 'details' : 'p'}>
                        {TextMessage}
                    </Typography>
                </>
            :   undefined}
            {isEIP712 ?
                <RenderEIP712
                    data={rawMessage as any}
                    title={<Typography className={classes.messageTitle}>Typed data</Typography>}
                    messageTitle={<Typography className={classes.messageTitle}>Message</Typography>}
                />
            :   undefined}
            {rawMessage && message !== rawMessage ?
                <>
                    <Typography className={classes.messageTitle}>
                        <Trans>Signing Message (Raw)</Trans>
                    </Typography>
                    <Typography className={classes.sourceText} component={isEIP4361 || isEIP712 ? 'details' : 'p'}>
                        {typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage, null, 2)}
                    </Typography>
                </>
            :   undefined}
        </main>
    )
})
SignRequestInfo.displayName = 'SignRequestInfo'

interface EIP4361RenderProps {
    message: ParsedEIP4361Message
    invalidFields: Array<keyof ParsedEIP4361Message>
    messageOrigin: string
}

const TextFragmentRender: RenderFragmentsContextType = {
    Link: (props) => {
        return (
            <Link href={props.href} style={props.style} target="_blank">
                {props.children}
            </Link>
        )
    },
}

function EIP4361Render({ message, messageOrigin, invalidFields }: EIP4361RenderProps) {
    const {
        address,
        chainId,
        domain,
        expiration_time,
        nonce,
        issued_at,
        not_before,
        request_id,
        resources,
        statement,
        uri,
        version,
    } = message
    const { classes, cx } = useStyles()

    const { useInteractionWallet } = useInteractionWalletContext()
    useInteractionWallet(address)

    // TODO: show warning for non https request
    const invalidDomain = invalidFields.includes('domain')
    const invalidVersion = invalidFields.includes('version')
    // TODO: invalid chainID
    const invalidChainId = invalidFields.includes('chainId')
    const invalidNotBefore = invalidFields.includes('not_before')
    const invalidExpirationTime = invalidFields.includes('expiration_time')

    const classesDangerTitle = cx(classes.messageTitle, classes.dangerField)
    const classesDangerField = cx([classes.sourceText, classes.dangerField])

    const normalFields = [
        <Fragment key="statement">
            <Typography className={classes.messageTitle}>
                <Trans>Message</Trans>
            </Typography>
            <Typography className={classes.sourceText}>
                {statement ?
                    <RenderFragmentsContext value={TextFragmentRender}>
                        <TypedMessageTextRender content={statement} serializable type="text" version={1} />
                    </RenderFragmentsContext>
                :   null}
            </Typography>
        </Fragment>,
        <Fragment key="uri">
            <Typography className={classes.messageTitle}>URI</Typography>
            <Typography className={classes.sourceText}>
                <RenderFragmentsContext value={TextFragmentRender}>
                    <TypedMessageTextRender content={uri} serializable type="text" version={1} />
                </RenderFragmentsContext>
            </Typography>
        </Fragment>,
        resources?.length ?
            <Fragment key="resources">
                <Typography className={classes.messageTitle}>
                    <Trans>Resource</Trans>
                </Typography>
                <Typography className={classes.sourceText}>
                    <RenderFragmentsContext value={TextFragmentRender}>
                        <TypedMessageTextRender content={resources.join('\n')} serializable type="text" version={1} />
                    </RenderFragmentsContext>
                </Typography>
            </Fragment>
        :   null,
        <Fragment key="issuedAt">
            <Typography className={classes.messageTitle}>
                <Trans>Issued at</Trans>
            </Typography>
            <Typography className={classes.sourceText}>{issued_at.toLocaleString()}</Typography>
        </Fragment>,
    ]
    const dangerFields = [
        invalidVersion ?
            <Fragment key="version">
                <Typography className={classesDangerTitle}>
                    <Trans>Version</Trans>
                </Typography>
                <Typography className={classesDangerField}>{version}</Typography>
                <Alert className={classes.dangerField} open>
                    <Trans>Unknown EIP-4361 message version.</Trans>
                </Alert>
            </Fragment>
        :   null,
    ]

    const domainJSX = (
        <Fragment key="domainJSX">
            <Typography className={invalidDomain ? classesDangerTitle : classes.messageTitle}>
                <Trans>Domain</Trans>
            </Typography>
            <Typography className={invalidDomain ? classesDangerField : classes.sourceText}>{domain}</Typography>
            {invalidDomain ?
                <Alert className={classes.dangerField} open>
                    <Trans>
                        The website ({messageOrigin}) is asking you to sign in to another domain ({message.domain}).
                        This may be a phishing attack.
                    </Trans>
                </Alert>
            :   null}
        </Fragment>
    )
    if (invalidDomain) dangerFields.push(domainJSX)
    else normalFields.push(domainJSX)

    const chainID_JSX = (
        <Fragment key="chainID">
            <Typography className={invalidChainId ? classesDangerTitle : classes.messageTitle}>
                <Trans>Chain ID</Trans>
            </Typography>
            <Typography className={invalidChainId ? classesDangerField : classes.sourceText}>{chainId}</Typography>
            {invalidChainId ?
                <Alert className={classes.dangerField} open>
                    <Trans>The chainID is not equal to the currently connected one.</Trans>
                </Alert>
            :   null}
        </Fragment>
    )
    if (invalidChainId) dangerFields.push(chainID_JSX)
    else normalFields.push(chainID_JSX)

    const notBeforeJSX =
        not_before ?
            <Fragment key="notBefore">
                <Typography className={invalidNotBefore ? classesDangerTitle : classes.messageTitle}>
                    <Trans>Request is valid not before</Trans>
                </Typography>
                <Typography className={invalidNotBefore ? classesDangerField : classes.sourceText}>
                    {not_before.toLocaleString()}
                </Typography>
                {invalidNotBefore ?
                    <Alert className={classes.dangerField} open>
                        <Trans>This request should only be sign in the future.</Trans>
                    </Alert>
                :   null}
            </Fragment>
        :   null
    if (invalidNotBefore) dangerFields.push(notBeforeJSX)
    else normalFields.push(notBeforeJSX)

    const expirationTimeJSX =
        expiration_time ?
            <Fragment key="expirationTime">
                <Typography className={invalidExpirationTime ? classesDangerTitle : classes.messageTitle}>
                    <Trans>Request is valid not after</Trans>
                </Typography>
                <Typography className={invalidExpirationTime ? classesDangerField : classes.sourceText}>
                    {expiration_time.toLocaleString()}
                </Typography>
                {invalidExpirationTime ?
                    <Alert className={classes.dangerField} open>
                        <Trans>This request has been expired.</Trans>
                    </Alert>
                :   null}
            </Fragment>
        :   null
    if (invalidExpirationTime) dangerFields.push(expirationTimeJSX)
    else normalFields.push(expirationTimeJSX)

    const nonceJSX = (
        <Fragment key="nonce">
            <Typography className={classes.messageTitle}>
                <Trans>Nonce</Trans>
            </Typography>
            <Typography className={classes.sourceText}>{nonce}</Typography>
        </Fragment>
    )
    normalFields.push(nonceJSX)

    const request_id_JSX =
        request_id ?
            <Fragment key="request_id">
                <Typography className={classes.messageTitle}>
                    <Trans>Request ID</Trans>
                </Typography>
                <Typography className={classes.sourceText}>{request_id}</Typography>
            </Fragment>
        :   null
    normalFields.push(request_id_JSX)

    return (
        <>
            {dangerFields}
            {normalFields}
        </>
    )
}
