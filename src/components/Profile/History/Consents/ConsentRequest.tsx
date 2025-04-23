interface ConsentRequestProps {
  values: string
  interactive?: boolean
}

function ConsentRequest({
  values,
  interactive
}: Readonly<ConsentRequestProps>) {
  const parsed = JSON.parse(values)

  return (
    <div>
      {Object.entries(parsed).map(([key, value]) => {
        return (
          <div key={key}>
            <span>{key}</span>
            {interactive ? (
              <input type="checkbox" checked={value} />
            ) : (
              <span>: {value ? 'Accepted' : 'Declined'}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ConsentRequest
