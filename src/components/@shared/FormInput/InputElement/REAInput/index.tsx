import { ReactElement, useState } from 'react'
import { useField } from 'formik'
import Input, { InputProps } from '@shared/FormInput'
import Label from '@shared/FormInput/Label'
import fieldStyles from '@shared/FormInput/index.module.css'
import inputStyles from '../index.module.css'

const communities = [
  ['01', 'Andalucía'],
  ['02', 'Aragón'],
  ['03', 'Asturias'],
  ['04', 'Illes Balears'],
  ['05', 'Canarias'],
  ['06', 'Cantabria'],
  ['07', 'Castilla y León'],
  ['08', 'Castilla-La Mancha'],
  ['09', 'Cataluña'],
  ['10', 'Comunitat Valenciana'],
  ['11', 'Extremadura'],
  ['12', 'Galicia'],
  ['13', 'Madrid'],
  ['14', 'Murcia'],
  ['15', 'Navarra'],
  ['16', 'País Vasco'],
  ['17', 'La Rioja'],
  ['18', 'Ceuta'],
  ['19', 'Melilla']
]

export default function REAInput({
  name,
  endpoint
}: InputProps & { endpoint: string }): ReactElement {
  const [field, , helpers] = useField(name)
  const params = new URLSearchParams(field.value[0].url.split('?')[1])
  const [communityCode, setCommunityCode] = useState(
    () => params.get('community_code') || ''
  )
  const [holderNif, setHolderNif] = useState(
    () => params.get('holder_nif') || ''
  )

  function updateFile(community: string, nif: string) {
    const complete =
      communities.some(([code]) => code === community) && !!nif.trim()
    const query = new URLSearchParams({
      community_code: community,
      holder_nif: nif.trim()
    })
    // Satisfy the publish schema locally without requesting sensitive REA data.
    helpers.setValue([
      {
        type: 'url',
        url: complete ? `${endpoint}?${query.toString()}` : '',
        valid: complete
      }
    ])
  }

  return (
    <>
      <div className={fieldStyles.field}>
        <Label htmlFor={`${name}.communityCode`}>Community</Label>
        <select
          id={`${name}.communityCode`}
          className={inputStyles.select}
          value={communityCode}
          required
          onChange={(e) => {
            setCommunityCode(e.target.value)
            updateFile(e.target.value, holderNif)
          }}
        >
          <option value="">Select a community</option>
          {communities.map(([code, community]) => (
            <option key={code} value={code}>
              {community}
            </option>
          ))}
        </select>
      </div>
      <Input
        name={`${name}.holderNif`}
        label="Holder NIF"
        type="text"
        required
        value={holderNif}
        onChange={(e) => {
          const nif = (e.target as HTMLInputElement).value
          setHolderNif(nif)
          updateFile(communityCode, nif)
        }}
      />
    </>
  )
}
