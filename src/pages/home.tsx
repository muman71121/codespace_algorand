import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

import MintDegreeForm from '../components/MintDegreeForm'
import VerifyDegreeForm from '../components/VerifyDegreeForm'
import PartnerInstitutions from '../components/PartnerInstitutions'
import ConnectWallet from '../components/ConnectWallet'
import { registeredInstitutions } from '../utils/registeredinstitutions'

export default function Home() {
  const navigate = useNavigate()
  const { activeAddress } = useWallet()

  const [menuOpen, setMenuOpen] = useState(false)
  const [openCompanyModal, setOpenCompanyModal] = useState(false)

  const [showMint, setShowMint] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [showPartners, setShowPartners] = useState(false)

  const matchedInstitution =
    registeredInstitutions.find(
      (inst: { wallet: string }) =>
        inst.wallet.toLowerCase() === (activeAddress || '').toLowerCase()
    ) || null

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>

        {/* LEFT SIDE */}
        <div style={styles.leftBlock}>

          {/* MENU */}
          <div style={styles.menuWrapper}>
            <button
              style={styles.menuButton}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Menu ▾
            </button>

            {menuOpen && (
              <div style={styles.dropdown}>
                <button
                  style={styles.item}
                  onClick={() => {
                    setShowMint(true)
                    setMenuOpen(false)
                  }}
                >
                  Issue Letter
                </button>

                <button
                  style={styles.item}
                  onClick={() => {
                    setShowVerify(true)
                    setMenuOpen(false)
                  }}
                >
                  Verify
                </button>

                <button
                  style={styles.item}
                  onClick={() => {
                    setShowPartners(true)
                    setMenuOpen(false)
                  }}
                >
                  Partner Institutions
                </button>
              </div>
            )}
          </div>

          {/* BRAND WITH SUBSCRIPT STYLE */}
          <div style={styles.brandInline}>
            <span style={styles.brandMain}>Letter-Chained</span>
            <span style={styles.brandSub}>by RZ Services</span>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div>
          <button
            style={styles.connectBtn}
            onClick={() => setOpenCompanyModal(true)}
          >
            Connect Company
          </button>
        </div>

      </header>

      {/* HERO */}
      <section style={{ ...styles.hero, ...styles.heroBg }}>
        <div style={styles.heroInner}>
          <h1 style={styles.title}>
            Immutable Experience Verification Infrastructure
          </h1>

          <p style={styles.subtitle}>
            In professional environments, experience records are often difficult to verify
            and prone to misrepresentation. Letter-Chained establishes a tamper-proof,
            blockchain-backed standard for issuing and validating employment and internship
            experience records.
          </p>

          <p style={styles.subtext}>
            Once issued, an experience letter becomes cryptographically verifiable and
            permanently immutable. It cannot be altered, forged, or backdated.
          </p>
        </div>
      </section>

      {/* CORE PRINCIPLE */}
      <section style={{ ...styles.section, ...styles.softSection }}>
        <div style={styles.grid}>
          <div style={styles.label}>Core Principle</div>
          <div style={styles.content}>
            A professional identity must be verifiable, not assumed. Letter-Chained replaces
            traditional paper-based and editable digital experience letters with a
            decentralized verification model anchored on blockchain integrity.
          </div>
        </div>
      </section>

      {/* ACCESS SYSTEM */}
      <section style={{ ...styles.section, ...styles.whiteSection }}>
        <div style={styles.grid}>
          <div style={styles.label}>Access System</div>
          <div style={styles.content}>
            The platform operates through a role-based ecosystem where organizations issue
            verifiable experience records and individuals present them for instant validation.
            All records are cryptographically signed and permanently stored on-chain.
          </div>
        </div>
      </section>

      {/* NETWORK */}
      <section style={{ ...styles.section, ...styles.softSection }}>
        <div style={styles.grid}>
          <div style={styles.label}>Network Statement</div>
          <div style={styles.content}>
            Letter-Chained introduces a verifiable standard for professional experience.
            Designed to reduce fraud, eliminate ambiguity, and strengthen trust in global
            employment systems.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        Blockchain-anchored verification infrastructure for professional experience records
      </footer>

      {/* CONNECT COMPANY */}
      <ConnectWallet
        openModal={openCompanyModal}
        closeModal={() => setOpenCompanyModal(false)}
        setConnectedInstitution={() => {}}
      />

      {/* MODALS */}
      {showMint && (
        <Modal title="Issue Experience Letter" onClose={() => setShowMint(false)}>
          <MintDegreeForm goBack={() => setShowMint(false)} wallet={matchedInstitution} />
        </Modal>
      )}

      {showVerify && (
        <Modal title="Verify Experience Letter" onClose={() => setShowVerify(false)}>
          <VerifyDegreeForm goBack={() => setShowVerify(false)} />
        </Modal>
      )}

      {showPartners && (
        <Modal title="Partner Institutions" onClose={() => setShowPartners(false)}>
          <PartnerInstitutions />
        </Modal>
      )}

    </div>
  )
}

/* ---------------- MODAL ---------------- */

function Modal({ title, onClose, children }: any) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>{title}</div>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#ffffff',
    color: '#0f172a',
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    minHeight: '100vh',
  },

  header: {
    padding: '16px 56px',
    borderBottom: '1px solid #eaeef3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },

  menuWrapper: {
    position: 'relative',
  },

  menuButton: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  dropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    width: 200,
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    zIndex: 10,
  },

  item: {
    width: '100%',
    padding: '10px 12px',
    background: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
  },

  /* INLINE SUBSCRIPT STYLE */
  brandInline: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
  },

  brandMain: {
    fontSize: 22,
    fontWeight: 600,
  },

  brandSub: {
    fontSize: 11,
    color: '#94a3b8',
    transform: 'translateY(3px)', // makes it "subscript-like"
    fontWeight: 500,
  },

  connectBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  hero: {
    padding: '90px 56px 50px',
  },

  heroBg: {
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
  },

  heroInner: {
    maxWidth: 920,
  },

  title: {
    fontSize: 44,
    fontWeight: 600,
    lineHeight: 1.15,
    marginBottom: 18,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 1.75,
    color: '#475569',
    marginBottom: 14,
  },

  subtext: {
    fontSize: 14,
    color: '#64748b',
  },

  section: {
    padding: '34px 56px',
  },

  softSection: {
    background: '#f8fafc',
  },

  whiteSection: {
    background: '#ffffff',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    gap: 40,
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },

  content: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#334155',
  },

  footer: {
    padding: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    borderTop: '1px solid #eaeef3',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  modal: {
    width: '90%',
    maxWidth: 900,
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },

  modalHeader: {
    padding: 14,
    borderBottom: '1px solid #eef2f6',
    display: 'flex',
    justifyContent: 'space-between',
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
  },
}