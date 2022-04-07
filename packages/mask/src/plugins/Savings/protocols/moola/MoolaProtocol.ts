import { ProtocolType } from '../../types'
import AAVELikeProtocol from '../common/protocol/AAVELikeProtocol'

export class MoolaProtocol extends AAVELikeProtocol {
    override get type() {
        return ProtocolType.Moola
    }
}
