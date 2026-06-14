/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import algosdk from 'algosdk'
import domtoimage from 'dom-to-image-more'
import { registeredInstitutions } from '../utils/registeredinstitutions'
import { CONFIG } from '../configure/network'


// ---------------- HASH (same style as proforma) ----------------
function formatExperienceData(
  name: string,
  dob: string,
  company: string,
  job: string,
) {
  return `${name.trim().toLowerCase()}|${dob.trim()}|${company
    .trim()
    .toLowerCase()}|${job.trim().toLowerCase()}`
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  )
  return new Uint8Array(buf)
}

// ---------------- AES KEY (DOB based like proforma seat) ----------------
async function deriveAesKeyFromDOB(dob: string): Promise<CryptoKey> {
  const material = new TextEncoder().encode(dob.trim())
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, [
    'decrypt',
  ])
}

// ---------------- BASE64 HELP ----------------
function fromBase64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

// ---------------- AES DECRYPT ----------------
async function aesGcmDecryptJSON(
  ivB64: string,
  cipherB64: string,
  dob: string,
): Promise<any> {
  const key = await deriveAesKeyFromDOB(dob)
  const ivBuf = fromBase64ToArrayBuffer(ivB64)
  const cipherBuf = fromBase64ToArrayBuffer(cipherB64)

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
    key,
    cipherBuf,
  )

  return JSON.parse(new TextDecoder().decode(plainBuf))
}

// ---------------- COMPONENT ----------------
export default function PrintExperienceLetter() {
  const [assetId, setAssetId] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')

  const [status, setStatus] = useState('')
  const [verified, setVerified] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [institutionName, setInstitutionName] = useState('')

  // ---------------- VERIFY + FETCH ----------------
  const handleVerify = async () => {
  try {
    setStatus('🔍 Fetching asset...')

    const indexer = new algosdk.Indexer('', CONFIG.indexer, '')

    const txns = await indexer
      .searchForTransactions()
      .assetID(Number(assetId))
      .txType('acfg')
      .limit(1)
      .do()

    if (!txns.transactions?.length) {
      throw new Error('Asset creation transaction not found')
    }

    const creationTxn = txns.transactions[0]

    // ---------------- FIX 1: note decoding ----------------
    const noteRaw = creationTxn.note
if (!noteRaw) throw new Error('No encrypted note found')

// handle both possible Algorand formats
const noteStr =
  typeof noteRaw === 'string'
    ? new TextDecoder().decode(
        Uint8Array.from(atob(noteRaw), (c) => c.charCodeAt(0)),
      )
    : new TextDecoder().decode(noteRaw)

const metadata = JSON.parse(noteStr)

    const enc = metadata?.properties?.enc
    if (!enc) throw new Error('No encryption metadata found')

    // ---------------- institution ----------------
    const institution = registeredInstitutions.find(
      (i) =>
        i.wallet.toLowerCase() === creationTxn.sender.toLowerCase(),
    )

    const companyName = institution?.name || 'Unknown Institution'
    setInstitutionName(companyName)

    // ---------------- FIX 2: metadataHash safe access ----------------
    const params =
      (creationTxn as any)?.['asset-config-transaction']?.params ||
      (creationTxn as any)?.params

    const onChainHash =
  params?.metadataHash ||
  params?.['metadata-hash']

    if (onChainHash) {
      const computed = await sha256(
        formatExperienceData(name, dob, companyName, jobTitle),
      )

      const toB64 = (u8: Uint8Array) =>
        btoa(String.fromCharCode(...u8))

      const onChainB64 = btoa(
        String.fromCharCode(
          ...Uint8Array.from(atob(onChainHash), (c) =>
            c.charCodeAt(0),
          ),
        ),
      )

      if (toB64(computed) !== onChainB64) {
        throw new Error('Identity verification failed')
      }
    }

    setVerified(true)

    // ---------------- DECRYPT ----------------
    const decrypted = await aesGcmDecryptJSON(
      enc.iv,
      enc.ciphertext,
      dob,
    )

    setData(decrypted)
    setStatus('✅ Verified & decrypted successfully')
  } catch (e: any) {
    console.error(e)
    setStatus(`❌ ${e.message}`)
    setVerified(false)
  }
}

  // ---------------- PRINT ----------------
  const handlePrint = async () => {
    try {
      const element =
        document.getElementById('experience-letter')
      if (!element) throw new Error('Letter not found')

      const img = await domtoimage.toPng(element, {
        bgcolor: '#ffffff',
        style: { backgroundColor: '#ffffff', color: '#000' },
      })

      const link = document.createElement('a')
      link.href = img
      link.download = `experience_letter_${name}.png`
      link.click()
    } catch (e: any) {
      setStatus(`❌ Print failed: ${e.message}`)
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        🏢 Experience Letter Verification & Print
      </h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Asset ID"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 w-full mb-2"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <button
        onClick={handleVerify}
        className="bg-blue-600 text-white py-2 px-4 rounded w-full"
      >
        Verify Experience Letter
      </button>

      {status && <p className="mt-3">{status}</p>}

      {/* ---------------- LETTER ---------------- */}
      {verified && data && (
        <>
          <div
            id="experience-letter"
            className="bg-white p-10 mt-5 border shadow"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold uppercase">
                {institutionName}
              </h1>
              <p className="text-sm mt-1">
                EXPERIENCE CERTIFICATE
              </p>
              <hr className="my-4" />
            </div>

            <p className="mb-4">
              This is to certify that{' '}
              <b>{data.name}</b> was employed with{' '}
              <b>{institutionName}</b>.
            </p>

            <p className="mb-4">
              He/She served as{' '}
              <b>{data.jobTitle}</b> in our
              organization.
            </p>

            <p className="mb-4">
              The employment period was from{' '}
              <b>{data.startDate}</b> to{' '}
              <b>{data.endDate}</b>.
            </p>

            <p className="mb-6">
              During this period, he/she performed duties
              satisfactorily and demonstrated professional
              competence.
            </p>

            <p className="mt-10">
              ___________________________<br />
              Authorized Signature
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-green-600 text-white py-2 px-4 mt-4 rounded"
          >
            Download / Print Letter
          </button>
        </>
      )}
    </div>
  )
}