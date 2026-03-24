import { gql } from 'urql'

export const getMetadataRequestsByRequester = gql`
  query MetadataRequestsByRequester($user: Bytes!) {
    metadataRequests(
      where: { requester: $user, status_not: 1 }
      orderBy: createdAt
      orderDirection: desc
      first: 20
    ) {
      id
      reason
      status
      createdAt
      expiresAt
      requester

      datasetAddress {
        id
        name
        owner {
          id
        }
        providerUrl
      }
      algorithmAddress {
        id
        name
        owner {
          id
        }
        providerUrl
      }
      votes {
        voter
        weight
        inFavourBitmap
      }
    }
  }
`

export const getMetadataRequestsForOwnedAssets = gql`
  query MetadataRequestsForOwnedAssets($user: Bytes!) {
    metadataRequests(
      where: { datasetAddress_: { owner: $user }, status_not: 1 }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      status
      createdAt
      expiresAt
      requester
      reason

      datasetAddress {
        id
        name
        owner {
          id
        }
        providerUrl
      }
      algorithmAddress {
        id
        name
        owner {
          id
        }
        providerUrl
      }
      votes {
        voter
        weight
        inFavourBitmap
      }
    }
  }
`

export const getMetadataSubRequestsById = gql`
  query MetadataSubRequestsById($id: ID!) {
    metadataRequests(where: { id: $id }) {
      subRequests {
        id
        requestType
        data
        yesWeight
        noWeight
      }
    }
  }
`

export const getMetadataRequestVotesById = gql`
  query MetadataRequestById($id: ID!) {
    metadataRequest(id: $id) {
      votes {
        voter
        inFavourBitmap
        weight
        data
      }
    }
  }
`
