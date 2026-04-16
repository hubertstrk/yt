export interface TicketComment {
  id: string;
  text: string;
  author: string;
  created: string;
}

export interface WorkItem {
  id: string;
  ticketId: string;
  durationMinutes: number;
  date: string;
  description?: string;
  workItemType: string;
}

export interface TicketInfo {
  id: string;
  summary: string;
  description: string;
  created: string;
  updated: string;
  comments: TicketComment[];
}
