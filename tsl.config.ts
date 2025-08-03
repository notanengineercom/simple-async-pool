import { core, defineConfig } from 'tsl'

export default defineConfig({
  rules: [
    ...core.all()
  ]
})
