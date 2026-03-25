import { useFormikContext } from 'formik'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { SubmitType } from '../MetadataRequestPetitions'
import styles from './index.module.css'

const DEFAULT_AMOUNT = 1
const DEFAULT_UNIT = 3600 * 24

export const TimePicker = ({
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
  const { setFieldValue, setFieldTouched } = useFormikContext<SubmitType>()

  const timeOptions = {
    week: 3600 * 24 * 7,
    day: 3600 * 24,
    hour: 3600,
    min: 60
  }

  const updateFormik = useCallback(
    (newAmount: number, newUnit: number) => {
      setFieldValue('expiresInSeconds', newAmount * newUnit)
      setFieldTouched('expiresInSeconds', true, false)
    },
    [setFieldValue, setFieldTouched]
  )

  useEffect(() => {
    setAmount(DEFAULT_AMOUNT)
    setUnit(DEFAULT_UNIT)

    updateFormik(DEFAULT_AMOUNT, DEFAULT_UNIT)
  }, [setAmount, setUnit, updateFormik])

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
        Expires In:
        <input
          type="number"
          className={styles.option}
          min={1}
          value={amount}
          onChange={handleAmountChange}
        />
      </label>
      <select value={unit} onChange={handleUnitChange}>
        {Object.entries(timeOptions).map(([unit, inSeconds]) => (
          <option key={unit} value={inSeconds} className={styles.option}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  )
}

export default { TimePicker }
