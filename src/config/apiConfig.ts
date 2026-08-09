export const API_URLS = {
  // appApiBase: 'https://buddy-node-backend-710178903619.asia-south1.run.app/api/v1',
  appApiBase: 'https://9426-2401-4900-1c71-7246-75f9-eddc-f00a-4ed5.ngrok-free.app/api/v1',

  // FastAPI AI_Orchestration server.
  // Run locally with:
  // uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 --reload
  buddyApiBase: 'https://buddy-ai-api-710178903619.asia-south1.run.app/api/v1',
  // buddyApiBase: 'http://192.168.1.102:8000/api/v1',
} as const;

export const BUDDY_ENDPOINTS = {
  chatBase: `${API_URLS.buddyApiBase}/chat`,
  speechBase: `${API_URLS.buddyApiBase}/speech`,
} as const;
