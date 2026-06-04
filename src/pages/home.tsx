import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brand}>Letter-Chained</div>
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

          <div style={styles.contentCol}>

            <div style={styles.block}>
              <h3 style={styles.subTitle}>Issuer</h3>
              <p style={styles.text}>
                Issue verifiable experience records for employees, interns, and contractors.
                Each record is cryptographically signed and permanently stored for validation.
              </p>

              <button
                style={styles.button}
                onClick={() => navigate('/dashboard?role=company')}
              >
                Enter Issuance Portal
              </button>
            </div>

            <div style={styles.divider} />

            <div style={styles.block}>
              <h3 style={styles.subTitle}>Verification</h3>
              <p style={styles.text}>
                Access and present verified experience records. Enable employers to validate
                professional history instantly without intermediaries.
              </p>

              <button
                style={styles.buttonSecondary}
                onClick={() => navigate('/dashboard?role=worker')}
              >
                Enter Verification Portal
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* NETWORK STATEMENT */}
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
    </div>
  )
}

/* ---------------- ENTERPRISE + SUBTLE COLOR SYSTEM ---------------- */

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
    background: '#ffffff',
  },

  brand: {
    fontSize: 18,
    fontWeight: 600,
    color: '#0f172a',
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
    letterSpacing: -0.5,
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
    lineHeight: 1.6,
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
    maxWidth: 1100,
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingTop: 6,
  },

  content: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#334155',
    maxWidth: 800,
  },

  contentCol: {
    maxWidth: 800,
  },

  block: {
    marginBottom: 22,
  },

  subTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: 8,
  },

  text: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 1.7,
    marginBottom: 12,
  },

  divider: {
    height: 1,
    background: '#eaeef3',
    margin: '18px 0',
  },

  button: {
    background: '#2563eb',
    border: 'none',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },

  buttonSecondary: {
    background: '#0f172a',
    border: 'none',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },

  footer: {
    padding: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    borderTop: '1px solid #eaeef3',
  },
}