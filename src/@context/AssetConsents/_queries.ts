import { gql } from 'urql'

export const getMetadataRequestsByRequester = gql`
  query MetadataRequestsList($user: Bytes!) {
    metadataRequests(
      where: { requester: $user }
      orderBy: createdAt
      orderDirection: desc
      first: 20
    ) {
      id
      status
      createdAt
      expiresAt

      erc721 {
        id
      }
    }
  }
`

export const getMetadataRequestsForOwnedAssets = gql`
  query MetadataRequestsForOwnedAssets($user: Bytes!) {
    metadataRequests(
      where: { erc721_: { owner: $user } }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      did
      status
      createdAt
      expiresAt

      erc721 {
        id
        name
      }
    }
  }
`

export const getMetadataRequestById = gql`
  query MetadataRequest($id: ID!) {
    metadataRequest(id: $id) {
      id
      did
      status
      createdAt
      decidedAt

      erc721 {
        id
        owner {
          id
        }
      }

      subRequests {
        id
        requestType
        data
        yesWeight
        noWeight
      }

      votes {
        voter
        approved
        weight
      }
    }
  }
`
