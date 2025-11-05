const fs = require('fs')
const os = require('os')

function getLocalAddresses() {
  const data = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(
      `${os.homedir}/.ocean/ocean-contracts/artifacts/address.json`,
      'utf8'
    )
  )
  return data.development
}

async function updateEnvVariable(key, value) {
  try {
    const data = await fs.promises.readFile('.env', 'utf8')
    const lines = data.split('\n')

    let keyExists = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith(key + '=')) {
        lines[i] = `${key}=${value}`
        keyExists = true
        break
      }
    }

    if (!keyExists) {
      lines.push(`${key}=${value}`)
    }

    const updatedContent = lines.join('\n')
    await fs.promises.writeFile('.env', updatedContent, 'utf8')
    console.log(
      `Successfully ${
        keyExists ? 'updated' : 'added'
      } the ${key} environment variable.`
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function main() {
  const addresses = getLocalAddresses()

  const updates = {
    NEXT_PUBLIC_NFT_FACTORY_ADDRESS: addresses.ERC721Factory,
    NEXT_PUBLIC_OPF_COMMUNITY_FEE_COLECTOR: addresses.OPFCommunityFeeCollector,
    NEXT_PUBLIC_FIXED_RATE_EXCHANGE_ADDRESS: addresses.FixedPrice,
    NEXT_PUBLIC_DISPENSER_ADDRESS: addresses.Dispenser,
    NEXT_PUBLIC_OCEAN_TOKEN_ADDRESS: addresses.Ocean,
    NEXT_PUBLIC_MARKET_DEVELOPMENT: true,
    NEXT_PUBLIC_PROVIDER_URL: 'http://host.docker.internal:8030', // Only for macOS
    NEXT_PUBLIC_SUBGRAPH_URI: 'http://host.docker.internal:9000', // Only for macOS
    NEXT_PUBLIC_METADATACACHE_URI: 'http://host.docker.internal:10000' // Only for macOS
  }

  for (const [key, value] of Object.entries(updates))
    await updateEnvVariable(key, value)

  console.log('All environment variables correctly updated')
}

main().catch((err) => {
  console.error('Error running script:', err)
  process.exit(1)
})
