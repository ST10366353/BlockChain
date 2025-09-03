import { API_ENDPOINTS, API_CONFIG, HTTP_STATUS } from '../services/api-config';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: {
      name: string;
      email?: string;
      url?: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  security: Array<{
    [key: string]: string[];
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  tags: Array<{
    name: string;
    description: string;
  }>;
}

class APIDocumentationGenerator {
  private spec: OpenAPISpec;

  constructor() {
    this.spec = this.generateOpenAPISpec();
  }

  private generateOpenAPISpec(): OpenAPISpec {
    return {
      openapi: '3.0.3',
      info: {
        title: 'DID Blockchain Wallet API',
        version: '1.0.0',
        description: 'Comprehensive API for Decentralized Identity (DID) and Verifiable Credentials management',
        contact: {
          name: 'API Support',
          email: 'support@did-blockchain.com',
          url: 'https://did-blockchain.com'
        }
      },
      servers: [
        {
          url: API_CONFIG.baseURL,
          description: 'Production server'
        },
        {
          url: API_CONFIG.devURL,
          description: 'Development server'
        }
      ],
      security: [
        {
          bearerAuth: []
        },
        {
          didAuth: []
        }
      ],
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes()
      },
      tags: this.generateTags()
    };
  }

  private generatePaths(): Record<string, any> {
    const paths: Record<string, any> = {};

    // DID Management endpoints
    paths['/did/resolve'] = {
      get: {
        tags: ['DID Management'],
        summary: 'Resolve DID Document',
        description: 'Resolve a Decentralized Identifier (DID) to its associated DID Document',
        parameters: [
          {
            name: 'did',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'The DID to resolve',
            example: 'did:web:example.com'
          }
        ],
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'DID resolution successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DIDResolutionResult' }
              }
            }
          },
          [HTTP_STATUS.NOT_FOUND]: {
            description: 'DID not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    };

    // Credentials endpoints
    paths['/credentials'] = {
      get: {
        tags: ['Credentials'],
        summary: 'Query Credentials',
        description: 'Query verifiable credentials with optional filters',
        parameters: [
          {
            name: 'subject',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by credential subject DID'
          },
          {
            name: 'issuer',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by credential issuer DID'
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by credential type'
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'revoked', 'expired'] },
            description: 'Filter by credential status'
          }
        ],
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'Credentials retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CredentialQueryResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Credentials'],
        summary: 'Issue New Credential',
        description: 'Issue a new verifiable credential',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CredentialIssuanceRequest' }
            }
          }
        },
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'Credential issued successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifiableCredential' }
              }
            }
          }
        }
      }
    };

    // Trust Registry endpoints
    paths['/trust/issuers'] = {
      get: {
        tags: ['Trust Registry'],
        summary: 'Get Trusted Issuers',
        description: 'Retrieve list of trusted credential issuers',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'suspended', 'revoked'] },
            description: 'Filter by issuer status'
          },
          {
            name: 'tags',
            in: 'query',
            schema: { type: 'array', items: { type: 'string' } },
            description: 'Filter by issuer tags'
          }
        ],
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'Trusted issuers retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TrustedIssuerList' }
              }
            }
          }
        }
      }
    };

    // Presentations endpoints
    paths['/presentations'] = {
      post: {
        tags: ['Presentations'],
        summary: 'Create Verifiable Presentation',
        description: 'Create a verifiable presentation from selected credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PresentationRequest' }
            }
          }
        },
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'Presentation created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifiablePresentation' }
              }
            }
          }
        }
      }
    };

    return paths;
  }

  private generateSchemas(): Record<string, any> {
    return {
      // Error schema
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          message: {
            type: 'string',
            description: 'Detailed error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp'
          }
        },
        required: ['error', 'message']
      },

      // DID Document schema
      DIDDocument: {
        type: 'object',
        properties: {
          '@context': {
            type: 'array',
            items: { type: 'string' },
            description: 'JSON-LD context'
          },
          id: {
            type: 'string',
            description: 'DID identifier'
          },
          controller: {
            type: 'string',
            description: 'DID controller'
          },
          verificationMethod: {
            type: 'array',
            items: { $ref: '#/components/schemas/VerificationMethod' },
            description: 'Verification methods'
          },
          authentication: {
            type: 'array',
            items: { type: 'string' },
            description: 'Authentication methods'
          },
          service: {
            type: 'array',
            items: { $ref: '#/components/schemas/Service' },
            description: 'DID services'
          }
        },
        required: ['@context', 'id']
      },

      VerificationMethod: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Verification method ID'
          },
          type: {
            type: 'string',
            description: 'Verification method type'
          },
          controller: {
            type: 'string',
            description: 'Controller DID'
          },
          publicKeyMultibase: {
            type: 'string',
            description: 'Public key in multibase format'
          }
        },
        required: ['id', 'type', 'controller']
      },

      Service: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Service ID'
          },
          type: {
            type: 'string',
            description: 'Service type'
          },
          serviceEndpoint: {
            type: 'string',
            description: 'Service endpoint URL'
          }
        },
        required: ['id', 'type', 'serviceEndpoint']
      },

      DIDResolutionResult: {
        type: 'object',
        properties: {
          didDocument: { $ref: '#/components/schemas/DIDDocument' },
          didResolutionMetadata: {
            type: 'object',
            properties: {
              contentType: { type: 'string' },
              retrieved: { type: 'string', format: 'date-time' },
              duration: { type: 'number' }
            }
          },
          didDocumentMetadata: {
            type: 'object',
            properties: {
              created: { type: 'string', format: 'date-time' },
              updated: { type: 'string', format: 'date-time' },
              deactivated: { type: 'boolean' }
            }
          }
        }
      },

      // Credential schemas
      VerifiableCredential: {
        type: 'object',
        properties: {
          '@context': {
            type: 'array',
            items: { type: 'string' },
            description: 'JSON-LD context'
          },
          type: {
            type: 'array',
            items: { type: 'string' },
            description: 'Credential types'
          },
          id: {
            type: 'string',
            description: 'Credential ID'
          },
          issuer: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/components/schemas/Issuer' }
            ],
            description: 'Credential issuer'
          },
          issuanceDate: {
            type: 'string',
            format: 'date-time',
            description: 'Issuance date'
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration date'
          },
          credentialSubject: {
            $ref: '#/components/schemas/CredentialSubject'
          },
          proof: {
            type: 'array',
            items: { $ref: '#/components/schemas/Proof' },
            description: 'Credential proof'
          }
        },
        required: ['@context', 'type', 'issuer', 'issuanceDate', 'credentialSubject']
      },

      Issuer: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issuer DID'
          },
          name: {
            type: 'string',
            description: 'Issuer name'
          },
          image: {
            type: 'string',
            description: 'Issuer logo URL'
          }
        },
        required: ['id']
      },

      CredentialSubject: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Subject ID'
          }
        },
        additionalProperties: true,
        description: 'Credential subject data'
      },

      Proof: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Proof type'
          },
          created: {
            type: 'string',
            format: 'date-time',
            description: 'Proof creation date'
          },
          verificationMethod: {
            type: 'string',
            description: 'Verification method'
          },
          proofPurpose: {
            type: 'string',
            description: 'Proof purpose'
          },
          proofValue: {
            type: 'string',
            description: 'Proof value'
          },
          jws: {
            type: 'string',
            description: 'JSON Web Signature'
          }
        },
        required: ['type', 'created', 'verificationMethod', 'proofPurpose']
      },

      CredentialIssuanceRequest: {
        type: 'object',
        properties: {
          issuerDid: {
            type: 'string',
            description: 'Issuer DID'
          },
          subjectDid: {
            type: 'string',
            description: 'Subject DID'
          },
          credentialData: {
            type: 'object',
            properties: {
              type: {
                type: 'array',
                items: { type: 'string' },
                description: 'Credential types'
              },
              credentialSubject: {
                type: 'object',
                description: 'Credential subject data'
              }
            }
          },
          issuerPrivateKey: {
            type: 'string',
            description: 'Issuer private key'
          },
          expiresIn: {
            type: 'string',
            description: 'Expiration time'
          }
        },
        required: ['issuerDid', 'subjectDid', 'credentialData', 'issuerPrivateKey']
      },

      CredentialQueryResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/VerifiableCredential' }
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              limit: { type: 'number' },
              offset: { type: 'number' },
              hasMore: { type: 'boolean' }
            }
          }
        }
      },

      // Trust Registry schemas
      TrustedIssuer: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issuer ID'
          },
          did: {
            type: 'string',
            description: 'Issuer DID'
          },
          name: {
            type: 'string',
            description: 'Issuer name'
          },
          description: {
            type: 'string',
            description: 'Issuer description'
          },
          status: {
            type: 'string',
            enum: ['active', 'suspended', 'revoked'],
            description: 'Issuer status'
          },
          trustLevel: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Trust level'
          },
          compliance: {
            type: 'array',
            items: { $ref: '#/components/schemas/ComplianceRequirement' },
            description: 'Compliance requirements'
          }
        },
        required: ['id', 'did', 'name', 'status']
      },

      ComplianceRequirement: {
        type: 'object',
        properties: {
          standard: {
            type: 'string',
            enum: ['GDPR', 'HIPAA', 'SOX', 'KYC', 'AML', 'CCPA'],
            description: 'Compliance standard'
          },
          level: {
            type: 'string',
            enum: ['basic', 'advanced', 'comprehensive'],
            description: 'Compliance level'
          },
          auditor: {
            type: 'string',
            description: 'Auditor name'
          }
        },
        required: ['standard', 'level']
      },

      TrustedIssuerList: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/TrustedIssuer' }
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              limit: { type: 'number' },
              offset: { type: 'number' },
              hasMore: { type: 'boolean' }
            }
          }
        }
      },

      // Presentation schemas
      VerifiablePresentation: {
        type: 'object',
        properties: {
          '@context': {
            type: 'array',
            items: { type: 'string' },
            description: 'JSON-LD context'
          },
          type: {
            type: 'array',
            items: { type: 'string' },
            description: 'Presentation types'
          },
          id: {
            type: 'string',
            description: 'Presentation ID'
          },
          holder: {
            type: 'string',
            description: 'Presentation holder DID'
          },
          verifiableCredential: {
            type: 'array',
            items: { $ref: '#/components/schemas/VerifiableCredential' },
            description: 'Included credentials'
          },
          proof: {
            type: 'array',
            items: { $ref: '#/components/schemas/Proof' },
            description: 'Presentation proof'
          }
        },
        required: ['@context', 'type', 'verifiableCredential']
      },

      PresentationRequest: {
        type: 'object',
        properties: {
          credentials: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                { $ref: '#/components/schemas/VerifiableCredential' }
              ]
            },
            description: 'Credentials to include in presentation'
          },
          holderDid: {
            type: 'string',
            description: 'Holder DID'
          },
          challenge: {
            type: 'string',
            description: 'Presentation challenge'
          },
          domain: {
            type: 'string',
            description: 'Presentation domain'
          },
          expiresIn: {
            type: 'string',
            description: 'Presentation expiration time'
          }
        },
        required: ['credentials', 'holderDid']
      }
    };
  }

  private generateSecuritySchemes(): Record<string, any> {
    return {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token authentication'
      },
      didAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'DID-based authentication',
        'x-did-auth': true
      }
    };
  }

  private generateTags(): Array<{ name: string; description: string }> {
    return [
      {
        name: 'DID Management',
        description: 'Endpoints for managing Decentralized Identifiers (DIDs)'
      },
      {
        name: 'Credentials',
        description: 'Verifiable credential issuance, verification, and management'
      },
      {
        name: 'Trust Registry',
        description: 'Trusted issuer registry and compliance management'
      },
      {
        name: 'Presentations',
        description: 'Verifiable presentation creation and management'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Audit',
        description: 'Audit logging and compliance reporting'
      }
    ];
  }

  /**
   * Get the complete OpenAPI specification
   */
  public getOpenAPISpec(): OpenAPISpec {
    return this.spec;
  }

  /**
   * Generate OpenAPI JSON string
   */
  public toJSON(): string {
    return JSON.stringify(this.spec, null, 2);
  }

  /**
   * Generate OpenAPI YAML string (simplified)
   */
  public toYAML(): string {
    // Simple YAML conversion - in production, use a proper YAML library
    const jsonToYaml = (obj: any, indent: number = 0): string => {
      const spaces = ' '.repeat(indent);
      let result = '';

      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          result += `${spaces}${key}:\n`;
          value.forEach(item => {
            if (typeof item === 'object') {
              result += `${spaces}  - ${jsonToYaml(item, indent + 4).trim()}\n`;
            } else {
              result += `${spaces}  - ${item}\n`;
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          result += `${spaces}${key}:\n`;
          result += jsonToYaml(value, indent + 2);
        } else {
          result += `${spaces}${key}: ${JSON.stringify(value)}\n`;
        }
      }

      return result;
    };

    return jsonToYaml(this.spec);
  }

  /**
   * Generate HTML documentation
   */
  public toHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DID Blockchain Wallet API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .endpoint {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
            margin-right: 10px;
        }
        .method.GET { background: #61affe; }
        .method.POST { background: #49cc90; }
        .method.PUT { background: #fca130; }
        .method.DELETE { background: #f93e3e; }
        .schema {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 4px;
            padding: 15px;
            margin-top: 15px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
        }
        .tag {
            display: inline-block;
            background: #e1f5fe;
            color: #0277bd;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DID Blockchain Wallet API</h1>
        <p>Comprehensive API for Decentralized Identity (DID) and Verifiable Credentials management</p>
        <p><strong>Version:</strong> 1.0.0</p>
    </div>

    <div id="api-content">
        ${this.generateHTMLEndpoints()}
    </div>

    <script>
        // Add interactive features
        document.addEventListener('DOMContentLoaded', function() {
            // Toggle schema visibility
            document.querySelectorAll('.schema-toggle').forEach(button => {
                button.addEventListener('click', function() {
                    const schema = this.nextElementSibling;
                    schema.style.display = schema.style.display === 'none' ? 'block' : 'none';
                });
            });
        });
    </script>
</body>
</html>`;
  }

  private generateHTMLEndpoints(): string {
    let html = '';

    for (const [path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods as any)) {
        html += `
        <div class="endpoint">
            <div>
                <span class="method ${method}">${method.toUpperCase()}</span>
                <strong>${path}</strong>
            </div>
            <div style="margin-top: 10px;">
                <h3>${operation.summary}</h3>
                <p>${operation.description}</p>
                ${operation.tags ? operation.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
            ${this.generateHTMLParameters(operation.parameters)}
            ${this.generateHTMLRequestBody(operation.requestBody)}
            ${this.generateHTMLResponses(operation.responses)}
        </div>`;
      }
    }

    return html;
  }

  private generateHTMLParameters(parameters?: any[]): string {
    if (!parameters || parameters.length === 0) return '';

    return `
    <div style="margin-top: 15px;">
        <h4>Parameters:</h4>
        <ul>
            ${parameters.map(param => `
                <li><strong>${param.name}</strong> (${param.in}) ${param.required ? '<em>required</em>' : ''} - ${param.description}</li>
            `).join('')}
        </ul>
    </div>`;
  }

  private generateHTMLRequestBody(requestBody?: any): string {
    if (!requestBody) return '';

    return `
    <div style="margin-top: 15px;">
        <h4>Request Body:</h4>
        <div class="schema">
            ${JSON.stringify(requestBody, null, 2)}
        </div>
    </div>`;
  }

  private generateHTMLResponses(responses?: any): string {
    if (!responses) return '';

    let html = '<div style="margin-top: 15px;"><h4>Responses:</h4>';

    for (const [statusCode, response] of Object.entries(responses as any)) {
      html += `
        <div>
            <strong>${statusCode}:</strong> ${response.description}
        </div>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate Postman collection
   */
  public toPostmanCollection(): any {
    return {
      info: {
        name: 'DID Blockchain Wallet API',
        description: this.spec.info.description,
        version: this.spec.info.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: this.generatePostmanItems(),
      variable: [
        {
          key: 'baseUrl',
          value: API_CONFIG.baseURL,
          type: 'string'
        }
      ]
    };
  }

  private generatePostmanItems(): any[] {
    const items: any[] = [];

    for (const [path, methods] of Object.entries(this.spec.paths)) {
      const folder: any = {
        name: this.getPathName(path),
        item: []
      };

      for (const [method, operation] of Object.entries(methods as any)) {
        folder.item.push({
          name: operation.summary,
          request: {
            method: method.toUpperCase(),
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            url: {
              raw: `{{baseUrl}}${path}`,
              host: ['{{baseUrl}}'],
              path: path.split('/').filter(p => p)
            },
            description: operation.description
          }
        });
      }

      items.push(folder);
    }

    return items;
  }

  private getPathName(path: string): string {
    const segments = path.split('/').filter(s => s && !s.includes('{'));
    if (segments.length === 0) return 'Root';

    // Capitalize first letter and join
    return segments.map(segment =>
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' ');
  }
}

// Export singleton instance
export const apiDocumentation = new APIDocumentationGenerator();

// Export the class for custom instances
export { APIDocumentationGenerator };

// Utility functions
export function generateAPIDocs(format: 'json' | 'yaml' | 'html' | 'postman' = 'json'): string | any {
  switch (format) {
    case 'json':
      return apiDocumentation.toJSON();
    case 'yaml':
      return apiDocumentation.toYAML();
    case 'html':
      return apiDocumentation.toHTML();
    case 'postman':
      return apiDocumentation.toPostmanCollection();
    default:
      return apiDocumentation.toJSON();
  }
}

// Auto-generate documentation files
export function generateDocumentationFiles(): void {
  if (typeof window === 'undefined') {
    // Node.js environment
    const fs = require('fs');
    const path = require('path');

    const docsDir = path.join(process.cwd(), 'docs', 'api');

    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Generate OpenAPI JSON
    fs.writeFileSync(
      path.join(docsDir, 'openapi.json'),
      apiDocumentation.toJSON()
    );

    // Generate HTML documentation
    fs.writeFileSync(
      path.join(docsDir, 'index.html'),
      apiDocumentation.toHTML()
    );

    // Generate Postman collection
    fs.writeFileSync(
      path.join(docsDir, 'postman-collection.json'),
      JSON.stringify(apiDocumentation.toPostmanCollection(), null, 2)
    );

    console.log('API documentation generated successfully!');
    console.log(`- OpenAPI JSON: ${path.join(docsDir, 'openapi.json')}`);
    console.log(`- HTML Documentation: ${path.join(docsDir, 'index.html')}`);
    console.log(`- Postman Collection: ${path.join(docsDir, 'postman-collection.json')}`);
  }
}
