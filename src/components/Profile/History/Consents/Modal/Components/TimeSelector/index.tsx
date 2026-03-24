import { useFormikContext } from 'formik'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { SubmitType } from '../MetadataRequestPetitions'
import styles from './index.module.css'

export const TimeSelector = ({
  amount,
  unit,
  setAmount,
  setUnit
}: Readonly<{
  amount: number
  unit: number
  setAmount: Dispatch<SetStateAction<number>>
  setUnit: Dispatch<SetStateAction<number>>
}>) => {
  const { values, setValues, errors, setErrors } =
    useFormikContext<SubmitType>()

  const timeOptions = {
    month: 3600 * 24 * 7 * 30,
    week: 3600 * 24 * 7,
    day: 3600 * 24,
    hour: 3600,
    min: 60
  }

  const updateFormik = useCallback(
    (newAmount: number, newUnit: number) => {
      const expiresIn = newAmount * newUnit

      if (newAmount < 1) {
        setErrors({ expiresInSeconds: 'Must be greater than 0' })
        return
      }

      setErrors({
        ...errors,
        expiresInSeconds: ''
      })

      setValues({
        ...values,
        expiresInSeconds: expiresIn
      })

      console.log('New values', values)
    },
    [errors, setErrors, setValues, values]
  )

  const handleAmountChange = (e) => {
    const newAmount = Number(e.target.value)
    setAmount(newAmount)
    updateFormik(newAmount, unit)
  }

  const handleUnitChange = (e) => {
    const newUnit = Number(e.target.value)
    setUnit(newUnit)
    updateFormik(amount, newUnit)
  }

  return (
    <div className={styles.options}>
      <label className={styles.options}>
        Expires In
        <input
          id="time-input"
          type="number"
          className={styles.option}
          defaultValue={1}
          min={1}
          onChange={handleAmountChange}
        />
      </label>
      <select id="unit-select" onChange={handleUnitChange}>
        {Object.entries(timeOptions).map(([unit, inSeconds]) => (
          <option key={unit} value={inSeconds} className={styles.option}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  )
}
