import axios from "axios";
import { AppError } from "../middleware/errorHandler";
import { TicketInfo } from "../models/ticket";

export class YouTrackService {
  private getAxiosInstance() {
    const baseUrl = process.env.YOUTRACK_BASE_URL;
    const apiToken = process.env.YOUTRACK_API_TOKEN;

    return axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async getTicketInfo(ticketId: string): Promise<TicketInfo> {
    try {
      const client = this.getAxiosInstance();

      // Get ticket details
      const ticketResponse = await client.get(`/api/issues/${ticketId}`, {
        params: {
          fields:
            "id,idReadable,summary,description,created,updated,customFields(name,value(name))",
        },
      });

      // Get ticket comments
      const commentsResponse = await client.get(
        `/api/issues/${ticketId}/comments`,
        {
          params: {
            fields: "id,text,author(login),created",
          },
        },
      );

      // Format comments and convert dates to local time
      const comments = commentsResponse.data.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        author: comment.author.login,
        created: new Date(comment.created).toLocaleString(),
      }));

      return {
        id: ticketResponse.data.idReadable,
        summary: ticketResponse.data.summary,
        description: ticketResponse.data.description || "",
        created: new Date(ticketResponse.data.created).toLocaleString(),
        updated: new Date(ticketResponse.data.updated).toLocaleString(),
        comments,
      };
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new AppError(`Ticket ${ticketId} not found`, 404);
        }
        if (error.response.status === 401 || error.response.status === 403) {
          throw new AppError("Authentication or authorization error", 401);
        }
      }
      throw new AppError(
        `Failed to fetch ticket information: ${error.message}`,
        500,
      );
    }
  }

  async createSubTicket(
    parentTicketId: string,
    title: string,
    description: string,
  ): Promise<{
    id: string;
    parentId: string;
    title: string;
    description: string;
    warnings: string[];
  }> {
    const client = this.getAxiosInstance();
    const warnings: string[] = [];

    // 1. Verify parent exists and get its project + custom fields
    let parentIssue: any;
    try {
      const parentResponse = await client.get(`/api/issues/${parentTicketId}`, {
        params: {
          fields:
            "id,idReadable,project(id,shortName),customFields(name,value(name))",
        },
      });
      parentIssue = parentResponse.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError(`Parent ticket ${parentTicketId} not found`, 404);
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError("Authentication or authorization error", 401);
      }
      throw new AppError(
        `Failed to verify parent ticket: ${error.message}`,
        500,
      );
    }

    // 2. Build custom fields: always set Type and Stage, inherit Project/Stakeholder from parent
    const parentCustomFields: any[] = parentIssue.customFields || [];
    const customFields: any[] = [
      {
        $type: "SingleEnumIssueCustomField",
        name: "Type",
        value: { $type: "EnumBundleElement", name: "User Story / New Feature" },
      },
      {
        $type: "StateIssueCustomField",
        name: "Stage",
        value: { $type: "StateBundleElement", name: "Backlog" },
      },
    ];
    for (const fieldName of ["Project", "Stakeholder", "Technical object"]) {
      const parentField = parentCustomFields.find(
        (f: any) => f.name === fieldName,
      );
      const parentValue = parentField?.value?.name;
      if (parentValue) {
        customFields.push({
          $type: "SingleEnumIssueCustomField",
          name: fieldName,
          value: { $type: "EnumBundleElement", name: parentValue },
        });
      }
    }

    // 3. Create the new issue in a single POST
    let newIssue: any;
    try {
      const createResponse = await client.post(
        "/api/issues",
        {
          project: { id: parentIssue.project.id },
          summary: title,
          description,
          customFields,
        },
        { params: { fields: "id,idReadable" } },
      );
      newIssue = createResponse.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new AppError(
          `Failed to create ticket: ${error.response.data?.error_description || error.message}`,
          400,
        );
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError("Authentication or authorization error", 401);
      }
      throw new AppError(`Failed to create ticket: ${error.message}`, 500);
    }

    // 4. Link new issue as subtask of parent via command executor
    try {
      await client.post(
        `/api/commands`,
        {
          issues: [{ id: newIssue.id }],
          query: `subtask of ${parentIssue.idReadable}`,
        },
        { params: { fields: "id" } },
      );
    } catch (error: any) {
      warnings.push(
        `Could not create subtask link: ${error.response?.data?.error_description || error.message}. ` +
          `The ticket was created but is not linked as a subtask.`,
      );
    }

    return {
      id: newIssue.idReadable,
      parentId: parentIssue.idReadable,
      title,
      description,
      warnings,
    };
  }

  async updateTicketDescription(
    ticketId: string,
    description: string,
  ): Promise<{ id: string; title: string; description: string }> {
    const client = this.getAxiosInstance();

    // Verify ticket exists and fetch summary
    let existingIssue: any;
    try {
      const verifyResponse = await client.get(`/api/issues/${ticketId}`, {
        params: { fields: "id,idReadable,summary" },
      });
      existingIssue = verifyResponse.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError(`Ticket ${ticketId} not found`, 404);
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError("Authentication or authorization error", 401);
      }
      throw new AppError(`Failed to verify ticket: ${error.message}`, 500);
    }

    // Update the description
    try {
      await client.post(
        `/api/issues/${ticketId}`,
        { description },
        { params: { fields: "id" } },
      );
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new AppError(
          `Failed to update ticket: ${error.response.data?.error_description || error.message}`,
          400,
        );
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError("Authentication or authorization error", 401);
      }
      throw new AppError(`Failed to update ticket: ${error.message}`, 500);
    }

    return { id: ticketId, title: existingIssue.summary, description };
  }

  async getTicketsChangedByRange(
    from: string,
    to: string,
  ): Promise<TicketInfo[]> {
    try {
      const client = this.getAxiosInstance();

      // Fetch issues updated in the date range
      const issuesResponse = await client.get("/api/issues", {
        params: {
          query: `updated: ${from} ..  ${to}`,
          fields:
            "id,idReadable,summary,description,created,updated,customFields(name,value(name))",
          $top: 20,
        },
      });

      const issues = issuesResponse.data;

      // comments for each issue
      const commentsByIssueId: Record<string, any[]> = {};
      await Promise.all(
        issues.map(async (issue: any) => {
          const commentsResponse = await client.get(
            `/api/issues/${issue.id}/comments`,
            {
              params: { fields: "id,text,author(login),created" },
            },
          );
          commentsByIssueId[issue.id] = commentsResponse.data.map(
            (comment: any) => ({
              id: comment.id,
              text: comment.text,
              author: comment.author.login,
              created: new Date(comment.created).toLocaleString(),
            }),
          );
        }),
      );

      // Map issues to TicketInfo format
      const tickets: TicketInfo[] = issues.map((issue: any) => {
        // issue.customFields
        return {
          id: issue.idReadable,
          summary: issue.summary,
          description: issue.description || "",
          created: new Date(issue.created).toLocaleString(),
          updated: new Date(issue.updated).toLocaleString(),
          comments: commentsByIssueId[issue.id] || [],
        };
      });

      return tickets;
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch changed tickets: ${error.message}`,
        500,
      );
    }
  }
}

export default new YouTrackService();
