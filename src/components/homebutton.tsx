/* eslint-disable prettier/prettier */
import React, { useState } from 'react'

interface HomeButtonProps {
  setShowPartners: (val: boolean) => void
  setShowMint: (val: boolean) => void
  setShowProforma: (val: boolean) => void
  setShowPrintProforma: (val: boolean) => void
  setShowPrintMarksheet: (val: boolean) => void
  setShowVerify: (val: boolean) => void
}

const HomeButton: React.FC<HomeButtonProps> = ({
  setShowPartners,
  setShowMint,
  setShowProforma,
  setShowPrintProforma,
  setShowPrintMarksheet,
  setShowVerify,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Dropdown toggles
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false)
  const [verifyDropdownOpen, setVerifyDropdownOpen] = useState(false)
  const [corporateDropdownOpen, setCorporateDropdownOpen] = useState(false)

  const [adminSubOpen, setAdminSubOpen] = useState<{ madrasa: boolean; university: boolean; school: boolean; skill: boolean }>({
    madrasa: false,
    university: false,
    school: false,
    skill: false,
  })
  const [studentSubOpen, setStudentSubOpen] = useState<{ madrasa: boolean; university: boolean; school: boolean; skill: boolean }>({
    madrasa: false,
    university: false,
    school: false,
    skill: false,
  })

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-white hover:bg-purple-800 rounded-full px-4 py-2 font-medium focus:outline-none"
      >
        Menu
      </button>

      {menuOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50 text-gray-700">
          {/* HOME */}
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </button>

          {/* PARTNER INSTITUTIONS */}
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold"
            onClick={() => {
              setShowPartners(true)
              setMenuOpen(false)
            }}
          >
            Partner Institutions
          </button>

          {/* CORPORATE PORTAL */}
          <div className="relative border-t my-1">
            <button
              className="w-full text-left px-4 py-2 font-bold text-purple-700 hover:bg-gray-50"
              onClick={() => setCorporateDropdownOpen(!corporateDropdownOpen)}
            >
              Corporate Portal ▾
            </button>

            {corporateDropdownOpen && (
              <div className="flex flex-col bg-white border-t text-gray-700">
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    alert('Issue Certificate feature coming soon!')
                    setMenuOpen(false)
                  }}
                >
                  Issue Certificates
                </button>

                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    alert('Issue Diploma feature coming soon!')
                    setMenuOpen(false)
                  }}
                >
                  Issue Diplomas
                </button>
              </div>
            )}
          </div>

          {/* ACADEMIC ADMIN PORTAL */}
          <div className="relative border-t my-1">
            <button
              className="w-full text-left px-4 py-2 font-bold text-purple-700 hover:bg-gray-50"
              onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
            >
              Academic Admin Portal ▾
            </button>

            {adminDropdownOpen && (
              <div className="flex flex-col bg-white border-t text-gray-700">
                {/* مدرسہ */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setAdminSubOpen(prev => ({ ...prev, madrasa: !prev.madrasa }))}
                >
                  مدرسہ ▾
                </button>
                {adminSubOpen.madrasa && <div className="pl-8 pb-2 text-sm text-gray-500">Coming soon...</div>}

                {/* UNIVERSITY */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setAdminSubOpen(prev => ({ ...prev, university: !prev.university }))}
                >
                  University ▾
                </button>
                {adminSubOpen.university && (
                  <div className="flex flex-col pl-8 pb-2">
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        setShowProforma(true)
                        setMenuOpen(false)
                      }}
                    >
                      Issue Semester Proforma / Transcript
                    </button>
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        setShowMint(true)
                        setMenuOpen(false)
                      }}
                    >
                      Issue Degree
                    </button>
                  </div>
                )}

                {/* Skill Building Institutes */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setAdminSubOpen(prev => ({ ...prev, skill: !prev.skill }))}
                >
                  Skill Building institutes ▾
                </button>
                {adminSubOpen.skill && (
                  <div className="flex flex-col pl-8 pb-2">
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        alert('Issue Certificate feature coming soon!')
                        setMenuOpen(false)
                      }}
                    >
                      Issue Certificates
                    </button>
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        alert('Issue Diploma feature coming soon!')
                        setMenuOpen(false)
                      }}
                    >
                      Issue Diplomas
                    </button>
                  </div>
                )}

                {/* SCHOOL */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setAdminSubOpen(prev => ({ ...prev, school: !prev.school }))}
                >
                  School ▾
                </button>
                {adminSubOpen.school && <div className="pl-8 pb-2 text-sm text-gray-500">Coming soon...</div>}
              </div>
            )}
          </div>

          {/* STUDENT PORTAL */}
          <div className="relative border-t my-1">
            <button
              className="w-full text-left px-4 py-2 font-bold text-purple-700 hover:bg-gray-50"
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
            >
              Student Portal ▾
            </button>

            {studentDropdownOpen && (
              <div className="flex flex-col bg-white border-t text-gray-700">
                {/* مدرسہ */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setStudentSubOpen(prev => ({ ...prev, madrasa: !prev.madrasa }))}
                >
                  مدرسہ ▾
                </button>
                {studentSubOpen.madrasa && <div className="pl-8 pb-2 text-sm text-gray-500">Coming soon...</div>}

                {/* UNIVERSITY */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setStudentSubOpen(prev => ({ ...prev, university: !prev.university }))}
                >
                  University ▾
                </button>
                {studentSubOpen.university && (
                  <div className="flex flex-col pl-8 pb-2">
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        setShowPrintProforma(true)
                        setMenuOpen(false)
                      }}
                    >
                      Print Semester Transcript / Proforma
                    </button>
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        setShowPrintMarksheet(true)
                        setMenuOpen(false)
                      }}
                    >
                      Print Marksheet
                    </button>
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        alert('Print Degree feature coming soon!')
                        setMenuOpen(false)
                      }}
                    >
                      Print Degree
                    </button>
                  </div>
                )}

                {/* Skill Building Institutes */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setStudentSubOpen(prev => ({ ...prev, skill: !prev.skill }))}
                >
                  Skill Building Institutes ▾
                </button>
                {studentSubOpen.skill && (
                  <div className="flex flex-col pl-8 pb-2">
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        alert('Print Certificate feature coming soon!')
                        setMenuOpen(false)
                      }}
                    >
                      Print Certificates
                    </button>
                    <button
                      className="text-left py-1 hover:text-purple-700"
                      onClick={() => {
                        alert('Print Diploma feature coming soon!')
                        setMenuOpen(false)
                      }}
                    >
                      Print Diplomas
                    </button>
                  </div>
                )}

                {/* SCHOOL */}
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => setStudentSubOpen(prev => ({ ...prev, school: !prev.school }))}
                >
                  School ▾
                </button>
                {studentSubOpen.school && <div className="pl-8 pb-2 text-sm text-gray-500">Coming soon...</div>}
              </div>
            )}
          </div>

          {/* VERIFICATION PORTAL */}
          <div className="relative border-t my-1">
            <button
              className="w-full text-left px-4 py-2 font-bold text-purple-700 hover:bg-gray-50"
              onClick={() => setVerifyDropdownOpen(!verifyDropdownOpen)}
            >
              Verification Portal ▾
            </button>

            {verifyDropdownOpen && (
              <div className="flex flex-col bg-white border-t text-gray-700">
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    alert('Verify Certificate feature coming soon!')
                    setMenuOpen(false)
                  }}
                >
                  Verify Certificate
                </button>
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    alert('Verify Diploma feature coming soon!')
                    setMenuOpen(false)
                  }}
                >
                  Verify Diploma
                </button>
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setShowPrintMarksheet(true)
                    setMenuOpen(false)
                  }}
                >
                  Verify Marksheet
                </button>
                <button
                  className="px-6 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setShowVerify(true)
                    setMenuOpen(false)
                  }}
                >
                  Verify Degree
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeButton
