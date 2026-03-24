import QueryBoundary from '@components/@shared/QueryBoundary'
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import { DeleteConsent } from './Buttons/DeleteConsent'
import { FinalizeConsent } from './Buttons/FinalizeConsent'
import { InspectModal } from './Buttons/InspectConsent'
import { ConsentRowActionsContext } from './ConsentRowActions.hooks'
import styles from './ConsentRowActions.module.css'

interface Props {
  request: MetadataRequest
}

export default function ConsentRowActions({
  request,
  children
}: PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null) // Trigger button container
  const dropdownRef = useRef<HTMLDivElement>(null) // Portal dropdown
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  // Calculate dropdown coordinates relative to trigger
  const calculateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY - 50,
        left: rect.right + window.scrollX
      })
    }
  }, [])

  // Recalculate position on window resize
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => {
      calculateCoords()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, calculateCoords])

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    // Calculate exactly where the button is on the screen
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      top: rect.top + window.scrollY - 50,
      left: rect.right + window.scrollX
    })

    setIsOpen((prev) => !prev)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <ConsentRowActionsContext.Provider
      value={{ request, renderMode: 'modals' }}
    >
      <div ref={triggerRef} className={styles.container}>
        <button
          className={styles.trigger}
          onClick={toggleMenu}
          aria-label="Actions"
        >
          ⋮
        </button>

        <div style={{ display: 'none' }}>
          <QueryBoundary>{children}</QueryBoundary>
        </div>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className={styles.dropdown}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 9999
              }}
            >
              {children}
            </div>,
            document.body
          )}
      </div>
    </ConsentRowActionsContext.Provider>
  )
}

ConsentRowActions.InspectConsent = InspectModal
ConsentRowActions.DeleteConsent = DeleteConsent
ConsentRowActions.FinalizeConsent = FinalizeConsent
