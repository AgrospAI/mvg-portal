import Eye from '@images/eye.svg'
import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/atoms/Modal'
import { useProfile } from '@context/Profile'
import { useConsentsPetition } from '@context/Profile/ConsentsPetitionProvider'
import { useUserPreferences } from '@context/UserPreferences'
import { useCancelToken } from '@hooks/useCancelToken'
import { Asset, LoggerInstance } from '@oceanprotocol/lib'
import {
  generateBaseQuery,
  getAsset,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  SortDirectionOptions,
  SortTermOptions
} from 'src/@types/aquarius/SearchQuery'
import { useAccount } from 'wagmi'
import styles from './ConsentPetitionModal.module.css'
import ModalSection from './Sections/ModalSection'
import ConsentRequest from '../ConsentRequest'
import { newConsent, parsePossibleRequest } from '@utils/consentsUser'

export default function ConsentPetitionModal() {
  const { address } = useAccount()
  const { isStartPetition, setIsStartPetition, dataset } = useConsentsPetition()
  const { chainIds } = useUserPreferences()
  const { ownAccount } = useProfile()
  const [page, setPage] = useState(1)
  const [algorithms, setAlgorithms] = useState<PagedAssets>()
  const newCancelToken = useCancelToken()

  const [selected, setSelected] = useState<Asset>()
  const [written, setWritten] = useState<Asset>()
  const [error, setError] = useState('')

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Asset>(undefined)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const reason = formData.get('reason').toString()
    formData.delete('reason')
    formData.delete('algorithm')

    const request = parsePossibleRequest(formData)
    console.log(formData)

    newConsent(address, dataset.id, selectedAlgorithm.id, reason, request)
      .then((data) => {
        setIsStartPetition(false)
        LoggerInstance.log(`Submitted: ${data}`)
      })
      .catch((error) => {
        LoggerInstance.error(error)
      })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

    setError(undefined)

    if (e.target.value) {
      try {
        setSelected(
          algorithms.results.filter((data) => data.id === e.target.value)[0]
        )
      } catch (error) {
        LoggerInstance.error(error)
        setSelected(undefined)
      }
    } else {
      setSelected(undefined)
    }
  }

  const handleWrite = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const did = e.target.value.trim()
    if (did) {
      getAsset(did, newCancelToken())
        .then((data) => {
          if (!data) {
            setWritten(undefined)
            setError('Asset not found')
          } else {
            setWritten(data)
            setError(undefined)
          }
        })
        .catch((error) => {
          console.log(error)
          LoggerInstance.error(error)
          setWritten(undefined)
          setError(error.message)
        })
    } else {
      setWritten(undefined)
    }
  }

  useEffect(() => {
    if (selected) {
      setSelectedAlgorithm(selected)
    } else if (written) {
      setSelectedAlgorithm(written)
    } else {
      setSelectedAlgorithm(undefined)
    }
  }, [selected, written])

  useEffect(() => {
    if (!isStartPetition) return
    const getAlgorithms = async () => {
      const filters = [] as FilterTerm[]

      filters.push(getFilterTerm('metadata.type', 'algorithm'))
      filters.push(getFilterTerm('nft.state', [0, 4, 5]))
      filters.push(getFilterTerm('nft.owner', address.toLowerCase()))

      const baseQueryParams = {
        chainIds,
        filters,
        sortOptions: {
          sortBy: SortTermOptions.Created,
          sortDirection: SortDirectionOptions.Descending
        },
        ignorePurgatory: true,
        esPaginationOptions: {
          from: (Number(page) - 1 || 0) * 9,
          size: 9
        }
      } as BaseQueryParams

      const query = generateBaseQuery(baseQueryParams)

      try {
        const result = await queryMetadata(query, newCancelToken())
        return result
      } catch (error) {
        if (axios.isCancel(error)) {
          LoggerInstance.log(error.message)
        } else {
          LoggerInstance.error(error.message)
        }
      }
    }

    getAlgorithms().then((data) => {
      console.log(data)
      setAlgorithms(data)
    })
  }, [address, chainIds, newCancelToken, ownAccount, page, isStartPetition])

  return (
    <Modal
      title=""
      onToggleModal={() => setIsStartPetition(!isStartPetition)}
      isOpen={isStartPetition}
    >
      <form onSubmit={handleSubmit}>
        <ModalSection
          title="1. Algorithm selection"
          className={styles.container}
        >
          <span>What algorithm do you want to access this dataset with?</span>
          <div className={styles.algorithmContainer}>
            <select
              name="algorithm"
              id="algorithm-select"
              onChange={handleSelectChange}
              className={styles.selector}
              disabled={written !== undefined}
            >
              <option value="">--Please choose one of your algorithms--</option>
              {algorithms &&
                algorithms.results &&
                algorithms.results.map((item, _) => (
                  <option key={item.id} value={item.id}>
                    {item.metadata.name}
                  </option>
                ))}
            </select>
            <i>-- or --</i>
            <input
              className={styles.reasonTextbox}
              name="algorithm-did"
              placeholder="did:op:6f3a2e2e63d603ecd37409b593960ae56404a4fe81c162292cc32f29e1f20db9"
              disabled={selected !== undefined}
              onChange={handleWrite}
              maxLength={100}
            />
            {error && (
              <span className={styles.errorMessage}>
                <Eye className={styles.alert} />
                {error}
              </span>
            )}
          </div>
        </ModalSection>
        {selectedAlgorithm && (
          <ModalSection title="2. Requests" className={styles.container}>
            <input
              name="reason"
              type="text"
              placeholder="This is where your reasons to use this data go"
              className={styles.reasonTextbox}
              maxLength={255}
            />
            Requests:
            <ConsentRequest
              values=""
              datasetDid={dataset.nft.address}
              datasetName={dataset.metadata.name}
              algorithmDid={selectedAlgorithm.nft.address}
              algorithmName={selectedAlgorithm.metadata.name}
              algorithmOwnerAddress={selectedAlgorithm.nft.owner}
              interactive
              showAll
            />
            <div className={styles.actions}>
              <Button
                size="small"
                name="submit"
                className={styles.submitButton}
                onClick={null}
              >
                Submit
              </Button>
            </div>
          </ModalSection>
        )}
      </form>
    </Modal>
  )
}
