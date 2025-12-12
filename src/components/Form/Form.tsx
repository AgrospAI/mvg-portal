import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import { FORM_SECTIONS } from './data'
import { questionnaireSchema } from './schema'
import styles from './Form.module.css'

const downloadCSV = (data) => {
  try {
    const csvRows = ['Campo;Valor']

    FORM_SECTIONS.forEach((section) => {
      section.questions.forEach((question) => {
        const value = data[question.id]
        const safeValueStr =
          value === null || value === undefined ? '' : String(value)
        const safeLabel = `"${question.label.replace(/"/g, '""')}"`
        const safeValue = `"${safeValueStr.replace(/"/g, '""')}"`
        csvRows.push(`${safeLabel};${safeValue}`)
      })
    })

    const csvString = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csvString], {
      type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `evaluacion_digital_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } catch (error) {
    console.error('Error generando CSV:', error)
    alert('Hubo un error al generar el archivo.')
  }
}

const FieldErrorMessage = ({ message }) => {
  if (!message) return null
  return (
    <div className={styles.errorMessage}>
      <span>{message}</span>
    </div>
  )
}

const RHFInputAdapter = ({ question, register, error }) => {
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={question.id} className={styles.label}>
        {question.label}
      </label>

      <div className={styles.inputWrapper}>
        <input
          id={question.id}
          type={question.type}
          placeholder={question.placeholder}
          className={`${styles.inputControl} ${error ? styles.inputError : ''}`}
          // Ajuste para números: permite vacíos sin romper validación inmediata
          {...register(question.id, {
            valueAsNumber: question.type === 'number'
          })}
        />
      </div>
      <FieldErrorMessage message={error?.message} />
    </div>
  )
}

const RHFSelectAdapter = ({ question, register, error }) => {
  const options = question.options?.map((o) => o.value) || []

  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={question.id} className={styles.label}>
        {question.label}
      </label>

      <div className={styles.inputWrapper}>
        <select
          id={question.id}
          className={`${styles.inputControl} ${error ? styles.inputError : ''}`}
          {...register(question.id)}
          defaultValue=""
        >
          <option value="" disabled className="text-gray-400">
            Seleccione una opción...
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <FieldErrorMessage message={error?.message} />
    </div>
  )
}

export const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(questionnaireSchema),
    mode: 'onBlur' // Valida cuando sales del campo
  })

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    downloadCSV(data)
  }

  const onError = (errors) => {
    console.log('Errores:', errors)
    alert('Por favor, revisa los campos marcados en rojo.')
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className={styles.formStack}
        >
          {FORM_SECTIONS.map((section) => (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.titleAccent}></span>
                  {section.title}
                </h2>
              </div>

              <div className={styles.sectionContent}>
                <div className={styles.gridContainer}>
                  {section.questions.map((question) => {
                    const error = errors[question.id]
                    let componentToRender = null

                    switch (question.type) {
                      case 'number':
                      case 'text':
                        componentToRender = (
                          <RHFInputAdapter
                            question={question}
                            register={register}
                            error={error}
                          />
                        )
                        break
                      case 'select':
                        componentToRender = (
                          <RHFSelectAdapter
                            question={question}
                            register={register}
                            error={error}
                          />
                        )
                        break
                      default:
                        return null
                    }
                    // El wrapper del grid item ahora se maneja directamente con CSS grid
                    // pero mantenemos el div key para React
                    return <div key={question.id}>{componentToRender}</div>
                  })}
                </div>
              </div>
            </div>
          ))}

          <div className={styles.submitWrapper}>
            <div className={styles.submitButtonContainer}>
              <Button
                style="primary"
                type="submit"
                disabled={isSubmitting}
                className={styles.customButton}
              >
                {isSubmitting ? (
                  <div className={styles.loadingContent}>
                    <Loader white />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  'Enviar y Descargar Evaluación'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Form
