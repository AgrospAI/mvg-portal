import { ReactElement, useCallback, useEffect, useState } from 'react'
import Tabs from '@shared/atoms/Tabs'
import PublishedList from './PublishedList'
import Downloads from './Downloads'
import ComputeJobs from './ComputeJobs'
import styles from './index.module.css'
import { getComputeJobs } from '@utils/compute'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useAccount } from 'wagmi'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import ConsentsTab from './Consents'
import { useUserConsents } from '@context/Profile/ConsentsProvider'

interface HistoryTab {
  title: string
  content: JSX.Element
}

const refreshInterval = 10000 // 10 sec.

function getTabs(
  accountId: string,
  userAccountId: string,
  autoWalletAccountId: string,
  jobs: ComputeJobMetaData[],
  isLoadingJobs: boolean,
  refetchJobs: boolean,
  setRefetchJobs: any,
  incomingConsents: Consent[],
  outgoingConsents: Consent[],
  isLoadingConsents: boolean,
  refetchConsents: boolean,
  setRefetchConsents: any
): HistoryTab[] {
  const defaultTabs: HistoryTab[] = [
    {
      title: 'Published',
      content: <PublishedList accountId={accountId} />
    },
    {
      title: 'Downloads',
      content: <Downloads accountId={accountId} />
    }
  ]
  const computeTab: HistoryTab = {
    title: 'Compute Jobs',
    content: (
      <ComputeJobs
        jobs={jobs}
        isLoading={isLoadingJobs}
        refetchJobs={() => setRefetchJobs(!refetchJobs)}
      />
    )
  }
  const consentsTab: HistoryTab = {
    title: 'Consents',
    content: (
      <ConsentsTab
        incomingConsents={incomingConsents}
        outgoingConsents={outgoingConsents}
        isLoading={isLoadingConsents}
        refetchConsents={() => setRefetchConsents(!refetchConsents)}
      />
    )
  }
  if (accountId === userAccountId || accountId === autoWalletAccountId) {
    defaultTabs.push(computeTab, consentsTab)
  }

  return defaultTabs
}

const tabsIndexList = {
  published: 0,
  downloads: 1,
  computeJobs: 2
}

export default function HistoryPage({
  accountIdentifier
}: {
  accountIdentifier: string
}): ReactElement {
  const { address: accountId } = useAccount()
  const { autoWallet } = useAutomation()
  const { chainIds } = useUserPreferences()
  const {
    incoming: incomingConsents,
    outgoing: outgoingConsents,
    isLoading: isLoadingConsents,
    refetch: refetchConsents,
    setRefetch: setRefetchConsents
  } = useUserConsents()

  const newCancelToken = useCancelToken()

  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])

  const [tabIndex, setTabIndex] = useState<number>()

  const fetchJobs = useCallback(
    async (type: string) => {
      if (!chainIds || chainIds.length === 0 || !accountId) {
        return
      }

      try {
        type === 'init' && setIsLoadingJobs(true)
        const computeJobs = await getComputeJobs(
          chainIds,
          accountIdentifier === autoWallet?.address
            ? autoWallet?.address
            : accountId,
          null,
          newCancelToken()
        )

        setJobs(computeJobs.computeJobs)
        setIsLoadingJobs(!computeJobs.isLoaded)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoadingJobs(false)
      }
    },
    [
      autoWallet?.address,
      accountIdentifier,
      accountId,
      chainIds,
      newCancelToken
    ]
  )

  useEffect(() => {
    fetchJobs('init')

    // init periodic refresh for jobs
    const balanceInterval = setInterval(
      () => fetchJobs('repeat'),
      refreshInterval
    )

    return () => {
      clearInterval(balanceInterval)
    }
  }, [accountId, refetchJobs, fetchJobs])

  const getDefaultIndex = useCallback((): number => {
    const url = new URL(location.href)
    const defaultTabString = url.searchParams.get('defaultTab')
    const defaultTabIndex = tabsIndexList?.[defaultTabString]

    if (!defaultTabIndex) return 0
    if (
      defaultTabIndex === tabsIndexList.computeJobs &&
      accountId !== accountIdentifier
    )
      return 0

    return defaultTabIndex
  }, [accountId, accountIdentifier])

  useEffect(() => {
    setTabIndex(getDefaultIndex())
  }, [getDefaultIndex])

  const tabs = getTabs(
    accountIdentifier,
    accountId,
    autoWallet?.address,
    jobs,
    isLoadingJobs,
    refetchJobs,
    setRefetchJobs,
    incomingConsents,
    outgoingConsents,
    isLoadingConsents,
    refetchConsents,
    setRefetchConsents
  )

  return (
    <Tabs
      items={tabs}
      className={styles.tabs}
      selectedIndex={tabIndex || 0}
      onIndexSelected={setTabIndex}
    />
  )
}
