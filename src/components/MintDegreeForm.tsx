/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import algosdk from 'algosdk'
import { useWallet } from '@txnlab/use-wallet-react'

// ✅ Registered institutions
import { registeredInstitutions } from '../utils/registeredinstitutions'

// Network config
import { algodClient, ASSETS } from '../configure/network' // ✅ updated import path and ASSETS

// -------------------- Degree Hash Helpers --------------------
function formatDegreeData(
  studentName: string,
  universityName: string,
  gradYear: string,
  degreeTitle: string,
  seatNumber: string,
  percentage: string,
) {
  return `${studentName.trim().toLowerCase()}|${universityName
    .trim()
    .toLowerCase()}|${gradYear.trim()}|${degreeTitle
    .trim()
    .toLowerCase()}|${seatNumber.trim().toLowerCase()}|${percentage}`
}

async function getDegreeHash(
  studentName: string,
  universityName: string,
  gradYear: string,
  degreeTitle: string,
  seatNumber: string,
  percentage: string,
): Promise<Uint8Array> {
  const formatted = formatDegreeData(
    studentName,
    universityName,
    gradYear,
    degreeTitle,
    seatNumber,
    percentage,
  )
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(formatted),
  )
  return new Uint8Array(hashBuffer)
}

// -------------------- AES-GCM Encryption Helpers --------------------
async function deriveAesKeyFromSeat(
  seatNumber: string,
): Promise<CryptoKey> {
  const material = new TextEncoder().encode(seatNumber.trim())
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey(
    'raw',
    hash,
    'AES-GCM',
    false,
    ['encrypt'],
  )
}

function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8))
}

/**
 * Encrypt a JSON payload using AES-GCM-256 with key derived from seat number
 */
async function aesGcmEncryptJSON(
  plainObj: any,
  seatNumber: string,
): Promise<{ ivB64: string; cipherB64: string }> {
  const key = await deriveAesKeyFromSeat(seatNumber)
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

// ---------- USDC Fee Config ----------
const USDC_ID = ASSETS.USDC
const USDC_DECIMALS = 6
const FEE_AMOUNT = 5 * 10 ** USDC_DECIMALS // 5 USDC per student
const FEE_RECEIVER =
  'CRL73DO2N6HT25UJVAF3VKSIXELBDOIQBZ44LTQCLYBLRCAHRYJBUNOVZQ'

// ---------- Required Columns ----------
const REQUIRED_COLUMNS = [
  'serialnumber',
  'studentseatnumber',
  'studentname',
  'fathername',
  'yearofgraduation',
  'nameoffaculty',
  'nameofdepartment',
  'degreetitle',
  'finalpercentage',
]

type MintDegreeFormProps = {
  wallet: { wallet: string; name: string } | null
  goBack: () => void
}

function normalizeHeader(h: string) {
  return h.replace(/\s+/g, '').toLowerCase()
}

export default function MintDegreeForm({
  wallet,
  goBack,
}: MintDegreeFormProps) {
  const { activeAddress, signTransactions } = useWallet()
  const [connectedInstitution, setConnectedInstitution] =
    useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ total: 0, done: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (wallet?.wallet || activeAddress) {
      const address = wallet?.wallet || activeAddress || ''
      const match = registeredInstitutions.find(
        (inst) =>
          inst.wallet.toLowerCase() === address.toLowerCase(),
      )
      setConnectedInstitution(match ? match.name : null)
    }
  }, [wallet, activeAddress])

  const handleFile = async (file: File) => {
    if (!activeAddress || !signTransactions) return

    setError(null)
    setLoading(true)
    setProgress({ total: 0, done: 0 })

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })
      if (!json || json.length === 0)
        throw new Error('Empty spreadsheet')

      // Map headers
      const headersRow: string[] = (json[0] || []).map((h: any) =>
        h ? String(h) : '',
      )
      const headerMap: Record<string, number> = {}
      headersRow.forEach(
        (h, idx) =>
          (headerMap[normalizeHeader(String(h || ''))] = idx),
      )

      const missing: string[] = []
      for (const rc of REQUIRED_COLUMNS) {
        if (headerMap[rc] === undefined) missing.push(rc)
      }
      if (missing.length > 0)
        throw new Error(
          `Missing required columns: ${missing.join(', ')}`,
        )

      // Parse rows
      const rows: any[] = []
      for (let r = 1; r < json.length; r++) {
        const row = json[r]
        if (!row || row.length === 0) continue
        const obj: any = {}
        for (const key of Object.keys(headerMap)) {
          obj[key] =
            row[headerMap[key]] !== undefined
              ? row[headerMap[key]]
              : ''
        }
        for (const k of Object.keys(obj))
          obj[k] = String(obj[k] ?? '').trim()

        const emptyFields = Object.entries(obj).filter(
          ([_, val]) => val === '',
        )
        if (emptyFields.length > 0)
          throw new Error(
            `Row ${r + 1} has empty fields: ${emptyFields
              .map(([k]) => k)
              .join(', ')}`,
          )
        rows.push(obj)
      }

      if (!connectedInstitution)
        throw new Error('Not a registered institution')

      setProgress({ total: rows.length, done: 0 })

      // ---------- Batch Minting Logic ----------
      const results: any[] = []
      const BATCH_SIZE = 16

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batchRows = rows.slice(i, i + BATCH_SIZE)
        const params = await algodClient.getTransactionParams().do()
        const txns: algosdk.Transaction[] = []

        const matchedInstitution =
          registeredInstitutions.find(
            (inst) => inst.name === connectedInstitution,
          )

        // Fee transaction if applicable
        if (!matchedInstitution?.feeExempt) {
          const feeTxn =
            algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
              {
                sender: activeAddress!,
                receiver: FEE_RECEIVER,
                amount: FEE_AMOUNT * batchRows.length,
                assetIndex: USDC_ID,
                suggestedParams: params,
              },
            )
          txns.push(feeTxn)
        } else {
          console.log(` Fee skipped for ${connectedInstitution}`)
        }

        const batchAssetNames: string[] = []

        for (const row of batchRows) {
          const payloadPlain = {
            seatNumber: String(row['studentseatnumber']),
            studentName: String(row['studentname']),
            fathersName: String(row['fathername']),
            year: String(row['yearofgraduation']),
            faculty: String(row['nameoffaculty']),
            department: String(row['nameofdepartment']),
            degreeTitle: String(row['degreetitle']),
            percentage: String(row['finalpercentage']),
          }

          const { ivB64, cipherB64 } =
            await aesGcmEncryptJSON(
              payloadPlain,
              String(row['studentseatnumber']),
            )

          const metadataHash = await getDegreeHash(
            String(row['studentname']),
            connectedInstitution,
            String(row['yearofgraduation']),
            String(row['degreetitle']),
            String(row['studentseatnumber']),
            String(row['finalpercentage']),
          )

          const metadata = {
            standard: 'arc69',
            description: 'Degree NFT (Privacy-Preserving)',
            properties: {
              enc: {
                alg: 'AES-GCM-256',
                iv: ivB64,
                ciphertext: cipherB64,
              },
            },
          }

          const assetName = `${row['degreetitle']} - Degree NFT`
          batchAssetNames.push(assetName)

          const nftTxn =
            algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
              {
                sender: activeAddress!,
                total: 1,
                decimals: 0,
                assetName,
                unitName: 'DEGREE',
                assetURL: '',
                note: new TextEncoder().encode(
                  JSON.stringify(metadata),
                ),
                defaultFrozen: false,
                suggestedParams: params,
                assetMetadataHash: metadataHash,
              },
            )
          txns.push(nftTxn)
        }

        const encodedUnsigned = txns.map((t) =>
          algosdk.encodeUnsignedTransaction(t),
        )
        const signedBlobs =
          await signTransactions(encodedUnsigned)
        if (!signedBlobs || signedBlobs.length === 0)
          throw new Error('Batch signing failed')

        const feeOffset = !matchedInstitution?.feeExempt
          ? 1
          : 0

        for (let k = 0; k < signedBlobs.length; k++) {
          const signed = signedBlobs[k]
          if (!signed)
            throw new Error('A transaction was not signed')
          const { txid } =
            await algodClient.sendRawTransaction(signed).do()
          const conf = await algosdk.waitForConfirmation(
            algodClient,
            txid,
            4,
          )

          if (k >= feeOffset) {
            const createdAssetId =
              (conf as any)['asset-index'] ||
              (conf as any)['assetIndex'] ||
              (conf as any)['inner-txns']?.[0]?.[
                'created-asset-id'
              ]

            const rowIndex = i + (k - feeOffset)
            const studentRow = rows[rowIndex]
            const mintedAssetName =
              batchAssetNames[k - feeOffset]

            results.push({
              seat: String(
                studentRow['studentseatnumber'] || '',
              ),
              name: String(studentRow['studentname'] || ''),
              father: String(studentRow['fathername'] || ''),
              university: connectedInstitution || '',
              degreeTitle: String(
                studentRow['degreetitle'] || '',
              ),
              year: String(
                studentRow['yearofgraduation'] || '',
              ),
              percentage: String(
                studentRow['finalpercentage'] || '',
              ),
              assetName: mintedAssetName,
              assetId: createdAssetId
                ? Number(createdAssetId)
                : undefined,
              txid,
              serial: Number(
                studentRow['serialnumber'] || 0,
              ),
            })

            setProgress((p) => ({
              total: p.total,
              done: p.done + 1,
            }))
          }
        }

        await new Promise((res) => setTimeout(res, 300))
      }

      // ---------- Export Results to Excel ----------
      const outRows = [
        [
          'Serial',
          'Seat Number',
          'Student Name',
          'Father',
          'University',
          'Degree Title',
          'Year',
          'Percentage',
          'Asset Name',
          'Asset ID',
          'Tx ID',
        ],
      ]

      results.sort((a, b) => (a.serial || 0) - (b.serial || 0))
      for (const r of results) {
        outRows.push([
          String(r.serial ?? ''),
          String(r.seat ?? ''),
          String(r.name ?? ''),
          String(r.father ?? ''),
          String(r.university ?? ''),
          String(r.degreeTitle ?? ''),
          String(r.year ?? ''),
          String(r.percentage ?? ''),
          String(r.assetName ?? ''),
          String(r.assetId ?? ''),
          String(r.txid ?? ''),
        ])
      }

      const outWb = XLSX.utils.book_new()
      const outWs = XLSX.utils.aoa_to_sheet(outRows)
      XLSX.utils.book_append_sheet(outWb, outWs, 'minted')
      const wbout = XLSX.write(outWb, {
        type: 'array',
        bookType: 'xlsx',
      })
      saveAs(
        new Blob([wbout], {
          type: 'application/octet-stream',
        }),
        'mint_results.xlsx',
      )

      alert(` Minting completed. ${results.length} NFTs minted.`)
      goBack()
    } catch (err: any) {
      console.error(err)
      setError(
        err?.message ||
          'Failed to process file and mint NFTs',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2">
        Batch Mint Degree NFTs (Excel Upload)
      </h2>

      <div className="text-sm text-gray-700">
        <strong>Connected Institution:</strong>
        <br />
        <code className="bg-gray-100 p-2 rounded block">
          {connectedInstitution ||
            'Not a registered institution'}
        </code>
      </div>

      {!connectedInstitution ? (
        <div className="text-red-600 mt-2">
          This wallet is not registered. Minting is disabled.
        </div>
      ) : (
        <>
          <p className="text-sm">
            Upload an Excel file (.xlsx) with these headers
            (order doesn't matter):
          </p>
          <ul className="text-xs list-disc ml-6">
            {REQUIRED_COLUMNS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <input
            type="file"
            accept=".xlsx,.xls"
            disabled={loading}
            onChange={(e) => {
              const f =
                e.target.files && e.target.files[0]
              if (f) handleFile(f)
              e.currentTarget.value = ''
            }}
            className="mt-2"
          />

          {loading && (
            <div className="mt-2">
              <div>
                Minting progress: {progress.done} /{' '}
                {progress.total}
              </div>
              <div className="w-full bg-gray-200 rounded h-3 mt-1">
                <div
                  style={{
                    width: `${
                      progress.total
                        ? (progress.done /
                            progress.total) *
                          100
                        : 0
                    }%`,
                  }}
                  className="h-3 rounded bg-blue-600"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 mt-2">
              Error: {error}
            </div>
          )}

          <button
            onClick={goBack}
            className="mt-4 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
          >
            Go Back
          </button>
        </>
      )}
    </div>
  )
}
