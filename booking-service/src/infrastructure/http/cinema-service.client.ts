import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';

export interface BookSeatsRequest {
  seatIds: string[];
}

export interface SessionSeatInfo {
  seatId: string;
  columnNumber: number;
  status: 'FREE' | 'OCCUPIED';
}

export interface SessionSeatsResponse {
  sessionId: string;
  film: {
    id: string;
    title: string;
  };
  rows: Array<{
    rowName: string;
    seats: SessionSeatInfo[];
  }>;
}

@Injectable()
export class CinemaServiceClient {
  private readonly logger = new Logger(CinemaServiceClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.CINEMA_SERVICE_URL || 'http://localhost:3003';
    this.apiKey = process.env.INTERNAL_API_KEY || '';
    
    if (!this.apiKey) {
      this.logger.warn('INTERNAL_API_KEY is not set');
    }
  }

  /**
   * Book seats for a session in the cinema service
   */
  async bookSeats(sessionId: string, seatIds: string[], userId: string): Promise<void> {
    const url = `${this.baseUrl}/sessions/${sessionId}/book`;
    
    this.logger.log(`Booking seats for session ${sessionId}: ${seatIds.join(', ')}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'x-user-id': userId,
        },
        body: JSON.stringify({ seatIds }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 404) {
          throw new NotFoundException(`Session ${sessionId} not found`);
        }
        
        if (response.status === 400) {
          throw new BadRequestException(error.message || 'Seats already occupied or invalid');
        }
        
        throw new Error(`Cinema service error: ${response.status} - ${error.message}`);
      }

      this.logger.log(`Successfully booked seats for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to book seats in cinema service: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  /**
   * Get seat availability for a session
   */
  async getSessionSeats(sessionId: string): Promise<SessionSeatsResponse> {
    const url = `${this.baseUrl}/sessions/${sessionId}/seats`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(`Session ${sessionId} not found`);
        }
        throw new Error(`Cinema service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get session seats: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  /**
   * Release seats when a booking is cancelled
   */
  async releaseSeats(sessionId: string, seatIds: string[]): Promise<void> {
    const url = `${this.baseUrl}/sessions/${sessionId}/release`;
    
    this.logger.log(`Releasing seats for session ${sessionId}: ${seatIds.join(', ')}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({ seatIds }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (response.status === 404) {
          throw new NotFoundException(`Session ${sessionId} not found`);
        }
        
        if (response.status === 400) {
          throw new BadRequestException(error.message || 'Invalid seats or session');
        }
        
        throw new Error(`Cinema service error: ${response.status} - ${error.message}`);
      }

      this.logger.log(`Successfully released seats for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to release seats in cinema service: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }
}
