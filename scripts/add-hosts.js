/**
 * Add hostname 127.0.0.1 mappings to /etc/hosts
 * Usage: sudo node add-hosts.js
 */

const fs = require('fs')
const path = '/etc/hosts'

const services = ['anvil', 'aquarius', 'graph-node', 'provider']

try {
  const hostsContent = fs.readFileSync(path, 'utf8')
  let newEntries = []

  services.forEach((host) => {
    const line = `127.0.0.1 ${host}`
    !hostsContent.includes(line) && newEntries.push(line)
  })

  if (newEntries.length === 0) {
    console.log('All entries already present. Nothing to add.')
    process.exit(0)
  }

  const updatedContent = hostsContent + '\n' + newEntries.join('\n') + '\n'
  fs.writeFileSync(path, updatedContent, 'utf8')

  console.log('Added entries:')
  newEntries.forEach((e) => console.log('  ' + e))
} catch (err) {
  console.error('Error modifying /etc/hosts:', err.message)
  process.exit(1)
}
