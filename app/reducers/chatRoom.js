// @flow
import * as chat from 'actions/chat'
import ChatRoom, {writable} from 'models/ChatRoom'
import ChatEntry, {writable as entryWritable} from 'models/ChatEntry'
import { handleActions } from 'redux-actions'
import { Action } from 'utils/types'

const initialState = null

export default handleActions({

  [chat.priv.chatReceived]: (state: ChatRoom, action: Action) => {
    const {contact, id, message} = action.payload

    if(state.history.some((entry: ChatEntry) => entry.id === id)) {
      return state
    }

    return state.set(writable.history, state.history.push(
      ChatEntry.create(id, contact.pubkey, message)
    ))
  },

  [chat.priv.chatSent]: (state: ChatRoom, action: Action) => {
    const {id, message} = action.payload
    return state
      .set(writable.lastRead, state.history.count() + 1)
      .set(writable.history, state.history.push(
        ChatEntry.create(id, null, message)
      ))
  },

  [chat.priv.chatAckReceived]: (state: ChatRoom, action: Action) => {
    const { id } = action.payload
    return state.update(writable.history,
      history => history.update(
        history.findIndex((entry: ChatEntry) => entry.id === id),
        (entry: ChatEntry) => entry.set(entryWritable.ack, true)
      ))
  },

  [chat.readAllRoom]: (state: ChatRoom, action: Action) => (
    state.set(writable.lastRead, state.history.count())
  ),

}, initialState )

