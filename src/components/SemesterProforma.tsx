/* eslint-disable no-console */
/* eslint-disable no-inner-declarations */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import algosdk from 'algosdk'
import { useWallet } from '@txnlab/use-wallet-react'
import { registeredInstitutions } from '../utils/registeredinstitutions'
import { algodClient, ASSETS } from '../configure/network'

// -------------------- Experience Letter Hash Helpers --------------------
function formatExperienceData(
  name: string,
  dob: string,
  companyName: string,
  jobTitle: string,
) {
  return `${name.trim().toLowerCase()}|${dob.trim()}|${companyName.trim().toLowerCase()}|${jobTitle.trim().toLowerCase()}`
}

async function getExperienceHash(
  name: string,
  dob: string,
  companyName: string,
  jobTitle: string,
): Promise<Uint8Array> {
  const formatted = formatExperienceData(name, dob, companyName, jobTitle)
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(formatted),
  )
  return new Uint8Array(hashBuffer)
}

// -------------------- AES-GCM Encryption (DOB Key) --------------------
async function deriveAesKeyFromDOB(dob: string): Promise<CryptoKey> {
  const material = new TextEncoder().encode(dob.trim())
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt'])
}

function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8))
}

async function aesGcmEncryptJSON(
  plainObj: any,
  dob: string,
): Promise<{ ivB64: string; cipherB64: string }> {
  const key = await deriveAesKeyFromDOB(dob)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(plainObj))

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  )

  return {
    ivB64: toBase64(iv),
    cipherB64: toBase64(new Uint8Array(cipherBuf)),
  }
}

// -------------------- USDC Fee Config --------------------
const USDC_ID = ASSETS.USDC
const USDC_DECIMALS = 6
const FEE_AMOUNT = 1 * 10 ** USDC_DECIMALS
const FEE_RECEIVER =
  'CRL73DO2N6HT25UJVAF3VKSIXELBDOIQBZ44LTQCLYBLRCAHRYJBUNOVZQ'

// -------------------- Props --------------------
type Props = {
  wallet: { wallet: string; name: string } | null
  goBack: () => void
}

// -------------------- Component --------------------
export default function ExperienceLetterBatchMint({
  wallet,
  goBack,
}: Props) {
  const { activeAddress, signTransactions } = useWallet()

  const [connectedInstitution, setConnectedInstitution] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ total: 0, done: 0 })
  const [error, setError] = useState<string | null>(null)

  // FORM STATE (replacing Excel)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [lastEducation, setLastEducation] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [experienceType, setExperienceType] = useState('Full-Time')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    const address = wallet?.wallet || activeAddress || ''
    const match = registeredInstitutions.find(
      (inst) => inst.wallet.toLowerCase() === address.toLowerCase(),
    )
    setConnectedInstitution(match ? match.name : null)
  }, [wallet, activeAddress])

  const handleMint = async () => {
  try {
    if (!name || !dob || !jobTitle || !lastEducation) {
      throw new Error('Missing required fields')
    }

    setLoading(true)
    setError(null)
    setProgress({ total: 1, done: 0 })

    const params = await algodClient.getTransactionParams().do()

    const companyName = connectedInstitution || ''

    const matchedInstitution = registeredInstitutions.find(
      (inst) => inst.name === connectedInstitution,
    )

    const txns: algosdk.Transaction[] = []

    // ---------------- FEE TX ----------------
    if (!matchedInstitution?.feeExempt) {
      const feeTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: activeAddress!,
        receiver: FEE_RECEIVER,
        amount: FEE_AMOUNT,
        assetIndex: USDC_ID,
        suggestedParams: params,
      })

      txns.push(feeTxn)
    } else {
      console.log(`Fee skipped for ${connectedInstitution}`)
    }

    // ---------------- ENCRYPT + METADATA ----------------
    const payloadPlain = {
      name,
      dob,
      lastEducation,
      jobTitle,
      companyName,
      startDate,
      endDate,
      experienceType,
      department,
      salary,
      remarks,
    }

    const { ivB64, cipherB64 } = await aesGcmEncryptJSON(payloadPlain, dob)

    const metadataHash = await getExperienceHash(
      name,
      dob,
      companyName,
      jobTitle,
    )

    const metadata = {
      standard: 'arc69',
      description: 'Experience Letter NFT (Privacy-Preserving)',
      properties: {
        enc: {
          alg: 'AES-GCM-256',
          iv: ivB64,
          ciphertext: cipherB64,
        },
      },
    }

    const assetName = `EXP-${jobTitle.slice(0, 3).toUpperCase()}-${name
      .slice(0, 3)
      .toUpperCase()}`
    const unitName = `EXP`

    const nftTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: activeAddress!,
      total: 1,
      decimals: 0,
      assetName,
      unitName,
      assetURL: '',
      note: new TextEncoder().encode(JSON.stringify(metadata)),
      defaultFrozen: false,
      suggestedParams: params,
      assetMetadataHash: metadataHash,
    })

    txns.push(nftTxn)

    // ---------------- SIGN + SEND ----------------
    const encoded = txns.map((t) => algosdk.encodeUnsignedTransaction(t))
    const signed = await signTransactions(encoded)

    if (!signed || signed.length === 0) {
      throw new Error('Signing failed')
    }

    let txid = ''
    let assetId: number | undefined

    for (let i = 0; i < signed.length; i++) {
      const s = signed[i]

      const res = await algodClient.sendRawTransaction(s!).do()
      txid = res.txid

      const conf = await algosdk.waitForConfirmation(algodClient, txid, 4)

      // extract asset id from NFT creation tx
      assetId =
        (conf as any)['asset-index'] ||
        (conf as any)['assetIndex'] ||
        assetId
    }

    // ---------------- EXCEL DOWNLOAD (ADDED) ----------------
    const XLSX = await import('xlsx')
    const { saveAs } = await import('file-saver')

    const outRows = [
      [
        'Name',
        'DOB',
        'Company',
        'Job Title',
        'Start Date',
        'End Date',
        'Asset ID',
        'Tx ID',
      ],
      [
        name,
        dob,
        companyName,
        jobTitle,
        startDate,
        endDate,
        assetId ?? '',
        txid,
      ],
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(outRows)
    XLSX.utils.book_append_sheet(wb, ws, 'experience_letter')

    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `experience_letter_${name}.xlsx`,
    )

    // ---------------- DONE ----------------
    setProgress({ total: 1, done: 1 })

    alert('Experience Letter NFT minted successfully')
    goBack()
  } catch (err: any) {
    console.error(err)
    setError(err.message || 'Mint failed')
  } finally {
    setLoading(false)
  }
}

  // -------------------- UI --------------------
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">
      </h2>

      <div className="text-sm">
        <strong>Company:</strong>{' '}
        <code className="bg-gray-100 p-1 rounded">
          {connectedInstitution || 'Not Registered'}
        </code>
      </div>

      {!connectedInstitution ? (
        <div className="text-red-600">
          Wallet not registered. Minting disabled.
        </div>
      ) : (
        <>
          {/* FORM */}
          <div className="grid grid-cols-2 gap-3">

            <input placeholder="Full Name" className="border p-2" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="flex flex-col gap-1">
  <label className="text-xs text-gray-600">Date of Birth</label>
  <input
    type="date"
    className="border p-2"
    value={dob}
    onChange={(e) => setDob(e.target.value)}
  />
</div>

            <input placeholder="Last Education" className="border p-2" value={lastEducation} onChange={(e) => setLastEducation(e.target.value)} />

            <select className="border p-2" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}>
              <option value="">Select Job Title</option>
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>Project Manager</option>
              <option>HR Manager</option>
              <option>Intern</option>
            </select>

            <div className="flex flex-col gap-1">
  <label className="text-xs text-gray-600">Start Date</label>
  <input
    type="date"
    className="border p-2"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />
</div>

            <div className="flex flex-col gap-1">
  <label className="text-xs text-gray-600">End Date</label>

  <select
    className="border p-2"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  >
    <option value="">Select End Date</option>
    <option value="present">Currently Working (Ongoing)</option>
  </select>

  <input
    type="date"
    className="border p-2"
    value={endDate === 'present' ? '' : endDate}
    min={
      startDate
        ? new Date(new Date(startDate).getTime() + 86400000)
            .toISOString()
            .split('T')[0]
        : undefined
    }
    onChange={(e) => {
      const selected = e.target.value

      // enforce strict +1 day rule in logic too
      if (startDate) {
        const start = new Date(startDate)
        const end = new Date(selected)

        if (end <= start) {
          alert('End date must be at least 1 day after start date')
          return
        }
      }

      setEndDate(selected)
    }}
    disabled={endDate === 'present'}
  />
</div>

            <select className="border p-2" value={experienceType} onChange={(e) => setExperienceType(e.target.value)}>
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>

            <input placeholder="Department" className="border p-2" value={department} onChange={(e) => setDepartment(e.target.value)} />

            <input placeholder="Salary (optional)" className="border p-2" value={salary} onChange={(e) => setSalary(e.target.value)} />

          </div>

          <textarea
            className="border p-2 mt-2"
            placeholder="Remarks / Performance Comments"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <button
            onClick={handleMint}
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded mt-2"
          >
            Mint Experience Letter
          </button>

          <button
            onClick={goBack}
            className="bg-gray-300 text-black py-2 rounded"
          >
            Go Back
          </button>

          {loading && (
            <div>
              Minting... {progress.done}/{progress.total}
            </div>
          )}

          {error && <div className="text-red-600">{error}</div>}
        </>
      )}
    </div>
  )
}