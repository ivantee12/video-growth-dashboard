import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/browser',
  use:{baseURL:'http://127.0.0.1:3100',viewport:{width:1440,height:1000}},
  webServer:{command:'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100',reuseExistingServer:false,env:{DATABASE_URL:'',FB_PAGE_ID:'',FB_PAGE_ACCESS_TOKEN:'',IG_ACCOUNT_ID:'',IG_ACCESS_TOKEN:'',TIKTOK_OPEN_ID:'',TIKTOK_ACCESS_TOKEN:'',NEXT_TELEMETRY_DISABLED:'1'}},
})
