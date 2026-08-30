export const API_URLS = {
  // appApiBase: 'https://buddy-node-backend-scz7pyp3ha-el.a.run.app/api/v1',              // preet cloud run server
  // appApiBase: 'https://buddy-node-backend-710178903619.asia-south1.run.app/api/v1',  //aditya cloud running
  appApiBase: 'https://53a4-2401-4900-1c2a-3ccf-dcb2-9c4b-1808-450a.ngrok-free.app/api/v1',


  // 

  // FastAPI AI_Orchestration server.
  // Run locally with:
  // uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 --reload
  // buddyApiBase: 'https://buddy-ai-api-710178903619.asia-south1.run.app/api/v1',
  buddyApiBase: 'https://9187-2401-4900-1c2a-3ccf-dcb2-9c4b-1808-450a.ngrok-free.app/api/v1',
} as const;

export const BUDDY_ENDPOINTS = {
  chatBase: `${API_URLS.buddyApiBase}/chat`,
  speechBase: `${API_URLS.buddyApiBase}/speech`,
  reminderVoiceBase: `${API_URLS.buddyApiBase}/reminders`,
  conversationEvents: `${API_URLS.appApiBase}/home/conversation-status-events`,
} as const;
 