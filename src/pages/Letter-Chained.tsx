/* eslint-disable prettier/prettier */
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from '../components/ConnectWallet'
import MintDegreeForm from '../components/MintDegreeForm'
import PartnerInstitutions from '../components/PartnerInstitutions'
import PrintMarksheet from '../components/PrintMarksheet'
import PrintProforma from '../components/PrintProforma'
import ProformaForm from '../components/SemesterProforma'
import VerifyDegreeForm from '../components/VerifyDegreeForm'
import { registeredInstitutions } from '../utils/registeredinstitutions'
import HomeButton from '../components/homebutton'

const CrediChain: React.FC = () => {
  const { activeAddress } = useWallet()

  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [showMint, setShowMint] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [showProforma, setShowProforma] = useState(false)
  const [showPrintProforma, setShowPrintProforma] = useState(false)
  const [showPrintMarksheet, setShowPrintMarksheet] = useState(false)
  const [showPartners, setShowPartners] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)

  const matchedInstitution =
    registeredInstitutions.find(
      (inst: { wallet: string }) =>
        inst.wallet.toLowerCase() === (activeAddress || '').toLowerCase()
    ) || null

  const Modal = ({ open, onClose, title, children }: any) => {
    if (!open) return null

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>{title}</div>
            <button style={styles.modalClose} onClick={onClose}>✕</button>
          </div>

          <div style={styles.modalBody}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <header style={styles.nav}>
        <div style={styles.navLeft}>
          <HomeButton
            setShowPartners={setShowPartners}
            setShowMint={setShowMint}
            setShowProforma={setShowProforma}
            setShowPrintProforma={setShowPrintProforma}
            setShowPrintMarksheet={setShowPrintMarksheet}
            setShowVerify={setShowVerify}
          />

          <div style={styles.brand}>
            Letter-Chained <span style={styles.subBrand}>by RZ Services</span>
          </div>
        </div>

        <div style={styles.navActions}>

          {/* MENU BUTTON */}
          <div style={{ position: 'relative' }}>
            <button
              style={styles.navBtnGhost}
              onClick={() => setOpenMenu(!openMenu)}
            >
              Menu ▾
            </button>

            {openMenu && (
              <div style={styles.dropdown}>
                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowMint(true)
                    setOpenMenu(false)
                  }}
                >
                  Issue Letter
                </button>

                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowVerify(true)
                    setOpenMenu(false)
                  }}
                >
                  Verify
                </button>

                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowPartners(true)
                    setOpenMenu(false)
                  }}
                >
                  Partner Institutions
                </button>
              </div>
            )}
          </div>

          <button
            style={styles.walletBtn}
            onClick={() => setOpenWalletModal(true)}
          >
            {activeAddress ? 'Connected' : 'Connect Institution'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Experience Letter Verification System
        </h1>

        <p style={styles.text}>
          A blockchain-based infrastructure for issuing and verifying professional experience letters.
          It eliminates ambiguity, prevents falsification, and establishes permanent trust in employment records.
        </p>
      </section>

      {/* SYSTEM PRINCIPLES */}
      <section style={styles.section}>
        <div style={styles.label}>System Principles</div>

        <div style={styles.textBlock}>
          <p><strong>Tamper-Proof Records</strong> — Experience letters are permanently stored and cannot be altered or forged.</p>
          <p><strong>Global Verification</strong> — Any employer can verify professional history instantly without intermediaries.</p>
          <p><strong>Employment Integrity</strong> — Ensures authenticity of work experience across industries and borders.</p>
        </div>
      </section>

      {/* BLOCKCHAIN */}
      <section style={styles.sectionAlt}>
        <div style={styles.label}>Blockchain Layer</div>

        <p style={styles.text}>
          Built on Algorand to ensure transparency, immutability, and verifiable global trust
          in professional experience records.
        </p>
      </section>

      {/* CONTACT */}
      <section style={styles.section}>
        <div style={styles.label}>Contact</div>

        <p style={styles.text}>
          For institutional onboarding, verification access, or system integration support.
        </p>

        <a style={styles.link} href="mailto:support@proofletter.io">
          Contact Support
        </a>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        ProofLetter — Experience Verification Infrastructure
      </footer>

      {/* MODALS */}
      <ConnectWallet
        openModal={openWalletModal}
        closeModal={() => setOpenWalletModal(false)}
        setConnectedInstitution={() => {}}
      />

      <Modal open={showMint} onClose={() => setShowMint(false)} title="Issue Experience Letter">
        <MintDegreeForm goBack={() => setShowMint(false)} wallet={matchedInstitution} />
      </Modal>

      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verify Experience Letter">
        <VerifyDegreeForm goBack={() => setShowVerify(false)} />
      </Modal>

      <Modal open={showProforma} onClose={() => setShowProforma(false)} title="Issue Record">
        <ProformaForm goBack={() => setShowProforma(false)} wallet={matchedInstitution} />
      </Modal>

      <Modal open={showPrintProforma} onClose={() => setShowPrintProforma(false)} title="Print Record">
        <PrintProforma />
      </Modal>

      <Modal open={showPrintMarksheet} onClose={() => setShowPrintMarksheet(false)} title="Summary">
        <PrintMarksheet />
      </Modal>

      <Modal open={showPartners} onClose={() => setShowPartners(false)} title="Institutions">
        <PartnerInstitutions />
      </Modal>

    </div>
  )
}

/* ---------------- ENTERPRISE WHITE UI ---------------- */

const styles: Record<string, React.CSSProperties> = {

  page: {
    background: '#ffffff',
    fontFamily: 'Inter, system-ui, Arial',
    color: '#0f172a',
  },

  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 56px',
    borderBottom: '1px solid #eef2f6',
    alignItems: 'center',
  },

  navLeft: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },

  navActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },

  brand: {
    fontSize: 18,
    fontWeight: 600,
  },

  subBrand: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 6,
  },

  navBtnGhost: {
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    padding: '9px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  walletBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  dropdown: {
    position: 'absolute',
    top: '40px',
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    width: 180,
    zIndex: 9999,
  },

  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },

  hero: {
    padding: '80px 56px 30px',
    maxWidth: 900,
  },

  title: {
    fontSize: 40,
    fontWeight: 600,
    marginBottom: 16,
  },

  text: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#475569',
  },

  section: {
    padding: '40px 56px',
  },

  sectionAlt: {
    padding: '40px 56px',
    background: '#f8fafc',
  },

  label: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 12,
  },

  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 800,
  },

  link: {
    color: '#0f172a',
    fontWeight: 500,
    textDecoration: 'underline',
  },

  footer: {
    padding: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    borderTop: '1px solid #eef2f6',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },

  modal: {
    width: '90%',
    maxWidth: 900,
    maxHeight: '90vh',
    background: '#fff',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  modalHeader: {
    padding: 14,
    borderBottom: '1px solid #eef2f6',
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: 0,
  },

  modalTitle: { fontWeight: 600 },

  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
  },

  modalBody: {
    padding: 20,
    overflowY: 'auto',
    flex: 1,
    maxHeight: 'calc(90vh - 60px)',
  },
}

export default CrediChain