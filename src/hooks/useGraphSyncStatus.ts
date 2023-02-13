import { useState, useEffect } from 'react'
import fetch from 'cross-fetch'
import { useOcean } from '../providers/Ocean'
import { useWeb3 } from '../providers/Web3'
import { Logger } from '@oceanprotocol/lib'
import Web3 from 'web3'
import { ConfigHelperConfig } from '@oceanprotocol/lib/dist/node/utils/ConfigHelper'

const blockDifferenceThreshold = 30
const graphQuery =
  '{"query":"  query Meta {   _meta {      block {        hash       number     }      deployment      hasIndexingErrors    }  }","variables":{},"operationName":"Meta"}'

export interface UseGraphSyncStatus {
  isGraphSynced: boolean
  blockHead: number
  blockGraph: number
}

async function fetchGraph(url: string, queryBody: string): Promise<Response> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: queryBody
    })

    return await response.json()
  } catch (error) {
    console.error('Error parsing json: ' + error.message)
  }
}

async function getBlockHead(config: ConfigHelperConfig) {
  const web3Instance = new Web3(config.nodeUri)
  const blockHead = await web3Instance.eth.getBlockNumber()
  return blockHead
}

async function getBlockSubgraph(subgraphUri: string) {
  const response: any = await fetchGraph(
    `${subgraphUri}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    graphQuery
  )
  const blockNumberGraph = Number(response.data._meta.block.number)
  return blockNumberGraph
}

export function useGraphSyncStatus(): UseGraphSyncStatus {
  const { config } = useOcean()
  const { block, web3Loading } = useWeb3()
  const [blockGraph, setBlockGraph] = useState<number>()
  const [blockHead, setBlockHead] = useState<number>()
  const [isGraphSynced, setIsGraphSynced] = useState(true)
  const [subgraphLoading, setSubgraphLoading] = useState(false)

  // Get and set head block
  useEffect(() => {
    if (!config?.nodeUri || web3Loading) return

    async function initBlockHead() {
      const blockHead = block || (await getBlockHead(config))
      setBlockHead(blockHead)
      Logger.log('[GraphStatus] Head block: ', blockHead)
    }
    initBlockHead()
  }, [web3Loading, block, config])

  // Get and set subgraph block
  useEffect(() => {
    if (!config?.subgraphUri) return

    async function initBlockSubgraph() {
      setSubgraphLoading(true)
      const blockGraph = await getBlockSubgraph(config.subgraphUri)
      setBlockGraph(blockGraph)
      setSubgraphLoading(false)
      Logger.log('[GraphStatus] Latest block from subgraph: ', blockGraph)
    }
    initBlockSubgraph()
  }, [config])

  // Set sync status
  useEffect(() => {
    if ((!blockGraph && !blockHead) || web3Loading || subgraphLoading) return

    const difference = blockHead - blockGraph

    if (difference > blockDifferenceThreshold) {
      setIsGraphSynced(false)
      return
    }
    setIsGraphSynced(true)
  }, [blockGraph, blockHead, web3Loading, subgraphLoading])

  return { blockHead, blockGraph, isGraphSynced }
}
