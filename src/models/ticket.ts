export interface TicketComment {
  id: string;
  text: string;
  author: string;
  created: string;
}

export interface TicketInfo {
  id: string;
  summary: string;
  description: string;
  status: string;
  created: string;
  updated: string;
  comments: TicketComment[];
}
