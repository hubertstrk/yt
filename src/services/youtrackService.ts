import axios from 'axios';
import { AppError } from '../middleware/errorHandler';
import { TicketInfo } from '../models/ticket';

export class YouTrackService {
  private getAxiosInstance() {
    const baseUrl = process.env.YOUTRACK_BASE_URL;
    const apiToken = process.env.YOUTRACK_API_TOKEN;

    return axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async getTicketInfo(ticketId: string): Promise<TicketInfo> {
    try {
      const client = this.getAxiosInstance();

      // Get ticket details
      const ticketResponse = await client.get(`/api/issues/${ticketId}`, {
        params: {
          fields: 'id,summary,description,created,updated,customFields(name,value(name))'
        }
      });

      // Get ticket comments
      const commentsResponse = await client.get(`/api/issues/${ticketId}/comments`, {
        params: {
          fields: 'id,text,author(login),created'
        }
      });

      // Extract status from custom fields
      const statusField = ticketResponse.data.customFields.find(
        (field: any) => field.name === 'State'
      );
      const status = statusField ? statusField.value.name : 'Unknown';

      // Format comments and convert dates to local time
      const comments = commentsResponse.data.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        author: comment.author.login,
        created: new Date(comment.created).toLocaleString()
      }));

      return {
        id: ticketResponse.data.id,
        summary: ticketResponse.data.summary,
        description: ticketResponse.data.description || '',
        status,
        created: new Date(ticketResponse.data.created).toLocaleString(),
        updated: new Date(ticketResponse.data.updated).toLocaleString(),
        comments
      };
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new AppError(`Ticket ${ticketId} not found`, 404);
        }
        if (error.response.status === 401 || error.response.status === 403) {
          throw new AppError('Authentication or authorization error', 401);
        }
      }
      throw new AppError(`Failed to fetch ticket information: ${error.message}`, 500);
    }
  }
}

export default new YouTrackService();
