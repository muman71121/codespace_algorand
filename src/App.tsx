import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

// Pages
import Home from './pages/home'
import ExperienceDashboard from './pages/Letter-Chained' // renamed conceptually
import LMS from './pages/lms'

const supportedWallets: SupportedWallet[] = [
  { id: WalletId.PERA },
  { id: WalletId.DEFLY },
  { id: WalletId.EXODUS }
]

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ExperienceDashboard />} />
            <Route path="/lms" element={<LMS />} />
          </Routes>
        </Router>
      </WalletProvider>
    </SnackbarProvider>
  )
}