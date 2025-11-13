const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string | null;
  venue: string;
  date: string | null;
  time: string | null;
}

export interface RegisterPayload {
  name: string;
  dept: string;
  year: number;
  event_id: string;
}

export interface ParticipantResponse {
  id: string;
  name: string;
  dept: string;
  year: number;
  event_id: string;
  created_at: string;
  event_title: string | null;
  event_date: string | null;
}

const handleResponse = async <T>(response: Response) => {
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(message.error || "Request failed");
  }

  return (await response.json()) as T;
};

export const getEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events`);
  return handleResponse<EventResponse[]>(response);
};

export const registerParticipant = async (payload: RegisterPayload) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string; participant: ParticipantResponse }>(response);
};

export const getParticipants = async () => {
  const response = await fetch(`${API_BASE_URL}/participants`);
  return handleResponse<ParticipantResponse[]>(response);
};

export { API_BASE_URL };

