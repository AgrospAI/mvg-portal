import axios, { CancelToken } from 'axios'

export const cancelToken = (
  fromSignal: AbortSignal
): CancelToken | undefined => {
  if (!fromSignal) return undefined

  if (fromSignal.aborted) {
    return new axios.CancelToken((c) => c('Already aborted'))
  }

  return new axios.CancelToken((c) => {
    fromSignal.addEventListener(
      'abort',
      () => {
        c('Operation cancelled')
      },
      { once: true }
    )
  })
}
