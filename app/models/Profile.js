// @flow
import { Record } from 'immutable'
import { gatewayRoot } from 'ipfs/index'
import { nextToken } from 'utils/tokenGenerator'

export const LOCAL_DATA_VERSION = 1
export const PUBLISH_DATA_VERSION = 1

export const writable = {
  dataVersion: 'dataVersion',
  storageKey: 'storageKey',
  hash: 'hash',
  identity: 'identity',
  bio: 'bio',
  pubkey: 'pubkey',
  passphrase: 'passphrase',
  avatarHash: 'avatarHash'
}

export const ProfileRecord = Record({
  dataVersion: LOCAL_DATA_VERSION,
  storageKey: null,
  hash: null,
  identity: '',
  bio: '',
  pubkey: null,
  passphrase: null,
  avatarHash: null
}, 'Profile')

export default class Profile extends ProfileRecord {
  dataVersion: number
  storageKey: string
  hash: ?string
  identity: string
  bio: string
  pubkey: string
  passphrase: string
  avatarHash: ?string

  static create(identity: string, passphrase: string, bio: string) {
    return new this().withMutations(profile => profile
      .set(writable.storageKey, nextToken(16))
      .set(writable.identity, identity)
      .set(writable.passphrase, passphrase)
      .set(writable.bio, bio)
    )
  }

  get avatarUrl(): ?string {
    return this.avatarHash ? gatewayRoot + this.avatarHash : null
  }

  get initials(): string {
    const names = this.identity.split(' ')
    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  // Return the object to be published in IPFS
  get publishObject(): {} {
    return {
      dataVersion: PUBLISH_DATA_VERSION,
      identity: this.identity,
      bio: this.bio,
      pubkey: this.pubkey,
      avatarHash: this.avatarHash,
    }
  }

  get chatPubsubTopic(): string {
    return this.pubkey + '/chat'
  }

  get contactsPubsubTopic() : string {
    return this.pubkey + '/contacts'
  }

  get sharesPubsubTopic() : string {
    return this.pubkey + '/shares'
  }
}
