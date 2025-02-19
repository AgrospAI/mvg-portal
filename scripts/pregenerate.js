child_process = require('child_process')
fs = require('fs')
path = require('path')

// Run the `write-repo-metadata` script and save output
try {
  const repoMetadata = child_process.execSync(
    'node ./scripts/write-repo-metadata',
    {
      encoding: 'utf-8'
    }
  )
  fs.writeFileSync('content/repo-metadata.json', repoMetadata)
  console.log('✅ Repo metadata written successfully.')
} catch (error) {
  console.error('❌ Error writing repo metadata:', error)
  process.exit(1)
}

// Run the Apollo codegen command
try {
  child_process.execSync('npm run codegen:apollo', { stdio: 'inherit' })
  console.log('✅ Apollo codegen completed.')
} catch (error) {
  console.error('❌ Error running Apollo codegen:', error)
  process.exit(1)
}

// Run the `write-networks-metadata` script and save output
try {
  const networkMetadataFile = fs.createWriteStream(
    'content/networks-metadata.json'
  )

  const scriptPath = path.resolve('scripts/write-networks-metadata.js')

  const networksProcess = child_process.spawn('node', [scriptPath], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  })

  networksProcess.stdout.pipe(networkMetadataFile)
  networksProcess.stderr.on('data', (data) => {
    console.error(`❌ Error writing networks metadata: ${data}`)
  })

  networksProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Error writing networks metadata. Exit CODE: ${code}`)
      process.exit(code)
    }
    console.log('✅ Networks metadata written successfully.')
  })
} catch (error) {
  console.error('❌ Error writing networks metadata:', error)
  process.exit(1)
}
