export const API_URLS = {
  appApiBase: 'https://buddy-node-backend-scz7pyp3ha-el.a.run.app/api/v1',              // preet cloud run server
  // appApiBase: 'https://buddy-node-backend-710178903619.asia-south1.run.app/api/v1',  //aditya cloud running
  // appApiBase: 'https://5904-2401-4900-1c6e-54df-4f-a347-1f0a-942a.ngrok-free.app/api/v1',



  // FastAPI AI_Orchestration server.
  // Run locally with:
  // uvicorn apps.api_gateway.main:app --host 0.0.0.0 --port 8000 --reload 
  buddyApiBase: 'https://buddy-ai-api-710178903619.asia-south1.run.app/api/v1',
  // buddyApiBase: 'https://2f92-2401-4900-1c6e-54df-4f-a347-1f0a-942a.ngrok-free.app/api/v1',
} as const;

export const BUDDY_ENDPOINTS = {
  chatBase: `${API_URLS.buddyApiBase}/chat`,
  speechBase: `${API_URLS.buddyApiBase}/speech`,
  reminderVoiceBase: `${API_URLS.buddyApiBase}/reminders`,
  conversationEvents: `${API_URLS.appApiBase}/home/conversation-status-events`,
} as const;
