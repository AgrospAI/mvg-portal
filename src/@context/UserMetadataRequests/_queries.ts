import { gql } from 'urql'

export const getMetadataRequests = gql`
  query GetMetadataRequests(
    $where: MetadataRequest_filter
    $first: Int = 100
    $orderBy: MetadataRequest_orderBy = expiresAt
    $orderDirection: OrderDirection = asc
  ) {
    metadataRequests(
      where: $where
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
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

export const getUserStats = gql`
  query GetUserStats($userAddress: ID!) {
    userCounter(id: $userAddress) {
      pendingCount
      totalCount
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
