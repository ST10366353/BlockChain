// Fix line 156
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.post\(/\/revoke\\, request\);', '    return apiClient.post(${API_ENDPOINTS.credentials.revoke}//revoke, request);' | Set-Content src/services/credentials-api.ts

// Fix line 161
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(/\/revocation-status\\\);', '    return apiClient.get(${API_ENDPOINTS.credentials.revocationStatus}//revocation-status);' | Set-Content src/services/credentials-api.ts

// Fix line 167
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(\?\);', '    return apiClient.get(${API_ENDPOINTS.credentials.bySubject}/);' | Set-Content src/services/credentials-api.ts

// Fix line 173
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(\?\);', '    return apiClient.get(${API_ENDPOINTS.credentials.byIssuer}/);' | Set-Content src/services/credentials-api.ts

// Fix line 179
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(\?\);', '    return apiClient.get(${API_ENDPOINTS.credentials.query}?);' | Set-Content src/services/credentials-api.ts

// Fix line 184
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(\?\);', '    return apiClient.get(${API_ENDPOINTS.credentials.query}/);' | Set-Content src/services/credentials-api.ts

// Fix line 189
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.put\(\?, updates\);', '    return apiClient.put(${API_ENDPOINTS.credentials.query}/, updates);' | Set-Content src/services/credentials-api.ts

// Fix line 194
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.delete\(\?\);', '    return apiClient.delete(${API_ENDPOINTS.credentials.query}/);' | Set-Content src/services/credentials-api.ts

// Fix line 199
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(/\/verify\\\);', '    return apiClient.get(${API_ENDPOINTS.credentials.query}//verify);' | Set-Content src/services/credentials-api.ts

// Fix line 205
(Get-Content src/services/credentials-api.ts) -replace '    return apiClient\.get\(\$\{API_ENDPOINTS\.credentials\.templates\}\);', '    return apiClient.get(${API_ENDPOINTS.credentials.templates});' | Set-Content src/services/credentials-api.ts
