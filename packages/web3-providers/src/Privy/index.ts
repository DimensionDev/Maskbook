import { Sniffings } from '@masknet/shared-base'
import { getAccessToken } from '@privy-io/react-auth'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { PrivySession, WalletAccount } from '../types/Privy.js'
import { PRIVY_AUTH_HOST } from './constants.js'

class PrivyAPI {
    private refreshToken: string | null = null
    private async getRefreshToken() {
        if (Sniffings.is_popup_page || Sniffings.is_dashboard_page)
            // eslint-disable-next-line no-restricted-globals
            return localStorage.getItem('privy:refresh_token')
        const url = urlcat(PRIVY_AUTH_HOST, '/v1/custom_jwt_account/authenticate')
        if (!process.env.PRIVY_APP_ID) {
            throw new Error('Missing PRIVY_APP_ID')
        }
        const token = await getAccessToken()
        const json = await fetchJSON<PrivySession>(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'privy-app-id': process.env.PRIVY_APP_ID,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                token,
            }),
        })
        return json.refresh_token
    }
    private async getSessions() {
        if (!this.refreshToken) {
            const stored = await this.getRefreshToken()
            this.refreshToken = stored ? JSON.parse(stored) : null
        }
        if (!this.refreshToken) throw new Error('No refresh token')
        const url = urlcat(PRIVY_AUTH_HOST, '/v1/sessions')
        const token = await getAccessToken()
        if (!process.env.PRIVY_APP_ID) {
            throw new Error('Missing PRIVY_APP_ID')
        }
        const json = await fetchJSON<PrivySession>(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'privy-app-id': process.env.PRIVY_APP_ID,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: this.refreshToken,
            }),
        })
        return json
    }
    async getWallets() {
        const sessions = await this.getSessions()
        return sessions.user.linked_accounts.filter((x) => x.type === 'wallet') as WalletAccount[]
    }
    async getEvmWallets() {
        const wallets = await this.getWallets()
        return wallets.filter((x) => x.chain_type === 'ethereum')
    }
    async getSolanaWallets() {
        const wallets = await this.getWallets()
        return wallets.filter((x) => x.chain_type === 'solana')
    }
}

export const Privy = new PrivyAPI()
