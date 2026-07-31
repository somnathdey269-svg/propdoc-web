import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ScraperJobDto {
  id: string;
  portalName: string;
  jobType: string;
  status: 'QUEUED' | 'INITIALIZING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  scrapeMode: string;
  totalItems: number;
  updatedItems: number;
  matchedItems: number;
  reviewQueuedItems: number;
  failedItems: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface CreateJobRequest {
  portalName: string;
  scrapeMode: 'FULL' | 'DELTA' | 'SINGLE_PROJECT' | 'PASS_1_ONLY' | 'PASS_2_ONLY';
  maxPages?: number;
  delayMs?: number;
  targetCities?: string[];
  targetLocalities?: string[];
  category?: string;
  singleProjectQuery?: string;
}

export interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: string;
}

/**
 * ExecutionService — Angular service for /api/execution/** endpoints.
 * Includes SSE subscription for live log streaming.
 */
@Injectable({ providedIn: 'root' })
export class ExecutionService {
  private readonly base = `${environment.apiBaseUrl}/api/execution`;

  constructor(private http: HttpClient) {}

  createJob(request: CreateJobRequest): Observable<ScraperJobDto> {
    return this.http.post<{ data: ScraperJobDto }>(`${this.base}/jobs`, request)
        .pipe(map(r => r.data));
  }

  listJobs(page = 0, size = 20): Observable<any> {
    return this.http.get<{ data: any }>(`${this.base}/jobs`, {
      params: { page, size }
    }).pipe(map(r => r.data));
  }

  getJob(id: string): Observable<ScraperJobDto> {
    return this.http.get<{ data: ScraperJobDto }>(`${this.base}/jobs/${id}`)
        .pipe(map(r => r.data));
  }

  cancelJob(id: string): Observable<void> {
    return this.http.post<{ data: void }>(`${this.base}/jobs/${id}/cancel`, {})
        .pipe(map(() => undefined));
  }

  retryJob(id: string): Observable<ScraperJobDto> {
    return this.http.post<{ data: ScraperJobDto }>(`${this.base}/jobs/${id}/retry`, {})
        .pipe(map(r => r.data));
  }

  getJobLogs(id: string, page = 0): Observable<any> {
    return this.http.get<{ data: any }>(`${this.base}/jobs/${id}/logs`, { params: { page } })
        .pipe(map(r => r.data));
  }

  getActiveJobs(): Observable<ScraperJobDto[]> {
    return this.http.get<{ data: ScraperJobDto[] }>(`${this.base}/jobs/active`)
        .pipe(map(r => r.data));
  }

  /**
   * Subscribe to live SSE log stream for a running job.
   * Returns an Observable that emits LogEntry objects in real time.
   * Angular SSE via EventSource (native browser API).
   */
  streamJobLogs(jobId: string): Observable<LogEntry> {
    const subject = new Subject<LogEntry>();
    const eventSource = new EventSource(`${this.base}/jobs/${jobId}/logs/stream`);

    eventSource.addEventListener('log', (event: MessageEvent) => {
      try {
        subject.next(JSON.parse(event.data) as LogEntry);
      } catch {}
    });

    eventSource.addEventListener('progress', (event: MessageEvent) => {
      // Progress updates handled separately in control panel component
    });

    eventSource.onerror = () => {
      eventSource.close();
      subject.complete();
    };

    // Clean up EventSource when Observable is unsubscribed
    return new Observable(observer => {
      const sub = subject.subscribe(observer);
      return () => {
        sub.unsubscribe();
        eventSource.close();
      };
    });
  }
}
