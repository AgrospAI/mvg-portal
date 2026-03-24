import { useField } from 'formik'
import { TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react'
import styles from './AutoResize.module.css'

interface AutoResizeProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
}

export const AutoResize = ({ name, ...props }: Readonly<AutoResizeProps>) => {
  const [field] = useField(name)
  const textareaRef = useRef(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto' // Reset height
      textarea.style.height = `${textarea.scrollHeight}px` // Set new height
    }
  }, [field.value]) // Run every time the value changes

  return (
    <textarea
      {...field}
      {...props}
      ref={textareaRef}
      className={styles.responseTextbox}
    />
  )
}
