import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private currentUserId?: string | null;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }

  /**
   * Set the current user ID for authenticated requests
   * @param userId - The ID of the current user or null to clear
   */
  public setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;
    console.log("ApiService - setting currentUserId:", userId);
  }

  /**
   * Get headers with optional user ID
   * @returns Headers with potential user ID
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...this.defaultHeaders };

    if (this.currentUserId) {
      // Add the CurrentUserId header for authorization
      (headers as Record<string, string>)["CurrentUserId"] = String(this.currentUserId);
    }

    return headers;
  }

  /**
   * Helper function to check the response, parse JSON if content exists,
   * and throw an error if the response is not OK.
   */
  private async processResponse<T>(
      res: Response,
      errorMessage: string,
  ): Promise<T> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        // Only try to parse JSON if there's content
        if (res.status !== 204 && res.headers.get("content-length") !== "0") {
          const errorInfo = await res.json();
          if (errorInfo?.message) {
            errorDetail = errorInfo.message;
          } else {
            errorDetail = JSON.stringify(errorInfo);
          }
        }
      } catch {
        // If parsing fails, keep using res.statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(
          detailedMessage,
      ) as ApplicationError;
      error.info = JSON.stringify(
          { status: res.status, statusText: res.statusText },
          null,
          2,
      );
      error.status = res.status;
      throw error;
    }

    // For 204 No Content responses, return an empty object
    if (res.status === 204) {
      return {} as T;
    }

    // Otherwise parse JSON
    return res.headers.get("Content-Type")?.includes("application/json")
        ? res.json() as Promise<T>
        : Promise.resolve(res as T);
  }

  /**
   * GET request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @returns JSON data of type T.
   */
  public async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.processResponse<T>(
        res,
        "An error occurred while fetching the data.\n",
    );
  }

  /**
   * POST request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @param data - The payload to post.
   * @returns JSON data of type T.
   */
  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(
        res,
        "An error occurred while posting the data.\n",
    );
  }

  /**
   * PUT request.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @param data - The payload to update.
   * @returns JSON data of type T or empty object for 204 responses.
   */
  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`Making PUT request to ${url} with CurrentUserId: ${this.currentUserId}`);

    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.processResponse<T>(
        res,
        "An error occurred while updating the data.\n",
    );
  }

  /**
   * DELETE request.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @returns JSON data of type T.
   */
  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.processResponse<T>(
        res,
        "An error occurred while deleting the data.\n",
    );
  }
}