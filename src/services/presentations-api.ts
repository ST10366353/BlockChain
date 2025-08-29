import { apiClient, handleAPIResponse, createQueryParams, APIResponse, APIError } from './api-client'
import { API_ENDPOINTS } from './api-config'

// Presentation types
export interface PresentationRequest {
  verifiableCredential: (string | VerifiableCredential)[]
  holder: string
  challenge?: string
  domain?: string
}

export interface PresentationVerificationRequest {
  presentation: string | VerifiablePresentation
  challenge?: string
  domain?: string
}

export interface PresentationVerificationResult {
  valid: boolean
  presentation?: VerifiablePresentation
  errors?: string[]
}

export interface VerifiablePresentation {
  '@context': string[]
  type: string[]
  verifiableCredential: (string | VerifiableCredential)[]
  holder: string
  proof?: PresentationProof
}

export interface PresentationProof {
  type: string
  created: string
  verificationMethod: string
  proofPurpose: string
  proofValue: string
  challenge?: string
  domain?: string
}

export interface VerifiableCredential {
  '@context': string[]
  type: string[]
  issuer: string
  credentialSubject: any
  issuanceDate?: string
  expirationDate?: string
  proof?: any
}

// Presentations API Client
export class PresentationsAPI {
  // Verify a verifiable presentation
  async verifyPresentation(request: PresentationVerificationRequest): Promise<PresentationVerificationResult> {
    const response = await apiClient.post<PresentationVerificationResult>(
      API_ENDPOINTS.credentials.presentations,
      request
    )
    return handleAPIResponse(response)
  }

  // Create a verifiable presentation from credentials
  createPresentation(
    credentials: (string | VerifiableCredential)[],
    holderDid: string,
    challenge?: string,
    domain?: string
  ): VerifiablePresentation {
    // Create a basic presentation structure
    // In a real implementation, this would be cryptographically signed
    const presentation: VerifiablePresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: credentials,
      holder: holderDid,
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: `${holderDid}#key-1`,
        proofPurpose: 'authentication',
        proofValue: 'z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGes...', // Placeholder
        ...(challenge && { challenge }),
        ...(domain && { domain })
      }
    }

    return presentation
  }

  // Create presentation with selective disclosure
  createSelectivePresentation(
    credentials: (string | VerifiableCredential)[],
    holderDid: string,
    fieldsToDisclose: Record<string, string[]>, // credential index -> fields to disclose
    challenge?: string,
    domain?: string
  ): VerifiablePresentation {
    // Filter credentials to only include specified fields
    const filteredCredentials = credentials.map((cred, index) => {
      if (typeof cred === 'string') {
        // JWT format - can't filter fields easily, return as-is
        return cred
      }

      const fields = fieldsToDisclose[index] || []
      if (fields.length === 0) {
        return cred
      }

      // Create filtered credential with only selected fields
      const filteredCredential: VerifiableCredential = {
        '@context': cred['@context'],
        type: cred.type,
        issuer: cred.issuer,
        credentialSubject: {},
        issuanceDate: cred.issuanceDate,
        expirationDate: cred.expirationDate
      }

      // Only include specified fields from credentialSubject
      fields.forEach(field => {
        if (cred.credentialSubject && cred.credentialSubject[field] !== undefined) {
          filteredCredential.credentialSubject[field] = cred.credentialSubject[field]
        }
      })

      // Add ID if it was requested
      if (fields.includes('id') && cred.credentialSubject?.id) {
        filteredCredential.credentialSubject.id = cred.credentialSubject.id
      }

      return filteredCredential
    })

    return this.createPresentation(filteredCredentials, holderDid, challenge, domain)
  }

  // Get presentation templates
  getPresentationTemplates(): PresentationTemplate[] {
    return [
      {
        id: 'job-application',
        name: 'Job Application',
        description: 'Standard presentation for job applications',
        requiredCredentials: ['UniversityDegree', 'IDDocument'],
        fields: ['name', 'degree', 'institution', 'graduationDate']
      },
      {
        id: 'age-verification',
        name: 'Age Verification',
        description: 'Verify user is above certain age',
        requiredCredentials: ['IDDocument'],
        fields: ['birthDate', 'age']
      },
      {
        id: 'health-pass',
        name: 'Health Certificate',
        description: 'COVID or health status verification',
        requiredCredentials: ['HealthCertificate'],
        fields: ['vaccinationStatus', 'testResults', 'validUntil']
      }
    ]
  }

  // Validate presentation against template
  validatePresentationAgainstTemplate(
    presentation: VerifiablePresentation,
    template: PresentationTemplate
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if all required credential types are present
    const credentialTypes = presentation.verifiableCredential.map(cred => {
      if (typeof cred === 'string') {
        // JWT format - can't easily check type
        return 'unknown'
      }
      return cred.type.filter(t => t !== 'VerifiableCredential')
    }).flat()

    template.requiredCredentials.forEach(requiredType => {
      if (!credentialTypes.includes(requiredType)) {
        errors.push(`Missing required credential type: ${requiredType}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Presentation template interface
export interface PresentationTemplate {
  id: string
  name: string
  description: string
  requiredCredentials: string[]
  fields: string[]
}

// Export singleton instance
export const presentationsAPI = new PresentationsAPI()
