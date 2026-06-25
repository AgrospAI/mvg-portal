import Input from '@shared/FormInput'
import { Field } from 'formik'
import { ReactElement } from 'react'
import content from '../../../../content/publish/form.json'
import { getFieldContent } from '@utils/form'

export default function AgriMetadataFields(): ReactElement {
  return (
    <>
      <Field
        {...getFieldContent('boundingBox', content.agriMetadata.fields)}
        component={Input}
        name="metadata.agriMetadata.boundingBox"
      />
      <Field
        {...getFieldContent('locationLabel', content.agriMetadata.fields)}
        component={Input}
        name="metadata.agriMetadata.boundingBox.label"
      />
      <Field
        {...getFieldContent('agrovocConcepts', content.agriMetadata.fields)}
        component={Input}
        name="metadata.agriMetadata.agrovocConcepts"
      />
      <Field
        {...getFieldContent(
          'temporalCoverageStart',
          content.agriMetadata.fields
        )}
        component={Input}
        name="metadata.agriMetadata.temporalCoverage.startDate"
      />
      <Field
        {...getFieldContent('temporalCoverageEnd', content.agriMetadata.fields)}
        component={Input}
        name="metadata.agriMetadata.temporalCoverage.endDate"
      />
    </>
  )
}
