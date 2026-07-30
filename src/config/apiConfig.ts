export const API_URLS = {
  appApiBase: 'https://52c5-223-178-210-108.ngrok-free.app/api/v1',

  // FastAPI AI_Orchestration server.
  // Run locally with:
  // uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 --reload
  buddyApiBase: 'http://192.168.1.71:8000/api/v1',
} as const;

export const BUDDY_ENDPOINTS = {
  chatBase: `${API_URLS.buddyApiBase}/chat`,
  speechBase: `${API_URLS.buddyApiBase}/speech`,
} as const;
