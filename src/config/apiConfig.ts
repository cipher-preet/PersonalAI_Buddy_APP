export const API_URLS = {
  // appApiBase: 'https://buddy-node-backend-710178903619.asia-south1.run.app/api/v1',
  appApiBase: 'https://62a2-2401-4900-1c2b-73b4-b169-375d-eceb-b1d2.ngrok-free.app/api/v1',

  // FastAPI AI_Orchestration server.
  // Run locally with:
  // uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 --reload
  // buddyApiBase: 'https://buddy-ai-api-710178903619.asia-south1.run.app/api/v1',
  buddyApiBase: 'https://f29f-2401-4900-1c2b-73b4-b169-375d-eceb-b1d2.ngrok-free.app/api/v1',
} as const;

export const BUDDY_ENDPOINTS = {
  chatBase: `${API_URLS.buddyApiBase}/chat`,
  speechBase: `${API_URLS.buddyApiBase}/speech`,
  conversationEvents: `${API_URLS.appApiBase}/home/conversation-status-events`,
} as const;
