import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ScraperPortal {
  id: string;
  portalName: string;
  displayName: string;
  baseUrl: string;
  sourceRole: 'PRIMARY' | 'SECONDARY';
  authType: 'NONE' | 'COOKIE' | 'LOGIN_FORM' | 'BEARER_TOKEN';
  rateLimitMs: number;
  maxPages: number;
  maxRetries: number;
  timeoutMs: number;
  requiresBrowser: boolean;
  browserType: string;
  proxyRequired: boolean;
  isActive: boolean;
  targetCities: string[];
  targetLocalities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UrlStrategy {
  id: string;
  entryUrl: string;
  entryMethod: string;
  paginationType: string;
  paginationUrlPattern: string;
  paginationStart: number;
  paginationMax: number;
  nextButtonSelector: string;
  hasDetailPages: boolean;
  detailUrlPattern: string;
  detailLinkSelector: string;
  detailLinkAttribute: string;
  hasSubTabs: boolean;
  tabSelectors: Array<{ label: string; selector: string; waitSelector: string }>;
  urlVariables: Array<{ name: string; source: string }>;
}

export interface FieldSelector {
  id: string;
  extractionContext: string;
  fieldName: string;
  mapsToColumn: string;
  primarySelector: string;
  fallbackSelector: string;
  selectorType: 'CSS' | 'XPATH' | 'REGEX' | 'JSON_LD' | 'ATTRIBUTE';
  extractAttribute: string;
  dataType: 'TEXT' | 'PRICE_INR' | 'DATE' | 'URL' | 'NUMBER' | 'BOOLEAN';
  transformRule: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
  displayOrder: number;
}

export interface ActionNode {
  type: 'NAVIGATE' | 'INTERACT' | 'DISCOVER_INDEX' | 'TAB_DRILLDOWN' | 'SCHEMA_EXTRACT' | 'UPSERT' | 'WAIT' | 'LOG';
  label: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * ScraperConfigService — Angular service for all scraper config APIs.
 * Wraps all /api/scraper/** endpoints.
 */
@Injectable({ providedIn: 'root' })
export class ScraperConfigService {
  private readonly base = `${environment.apiBaseUrl}/api/scraper`;

  constructor(private http: HttpClient) {}

  // ===== PORTALS =====

  listPortals(filters?: { sourceRole?: string; isActive?: boolean }, page = 0, size = 20):
      Observable<PageResponse<ScraperPortal>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters?.sourceRole) params = params.set('sourceRole', filters.sourceRole);
    if (filters?.isActive !== undefined) params = params.set('isActive', filters.isActive);
    return this.http.get<ApiResponse<PageResponse<ScraperPortal>>>(`${this.base}/portals`, { params })
        .pipe(map(r => r.data));
  }

  getPortal(id: string): Observable<ScraperPortal> {
    return this.http.get<ApiResponse<ScraperPortal>>(`${this.base}/portals/${id}`)
        .pipe(map(r => r.data));
  }

  createPortal(portal: Partial<ScraperPortal>): Observable<ScraperPortal> {
    return this.http.post<ApiResponse<ScraperPortal>>(`${this.base}/portals`, portal)
        .pipe(map(r => r.data));
  }

  updatePortal(id: string, portal: Partial<ScraperPortal>): Observable<ScraperPortal> {
    return this.http.put<ApiResponse<ScraperPortal>>(`${this.base}/portals/${id}`, portal)
        .pipe(map(r => r.data));
  }

  togglePortal(id: string): Observable<ScraperPortal> {
    return this.http.patch<ApiResponse<ScraperPortal>>(`${this.base}/portals/${id}/toggle`, {})
        .pipe(map(r => r.data));
  }

  deletePortal(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/portals/${id}`)
        .pipe(map(() => undefined));
  }

  // ===== URL STRATEGY =====

  getUrlStrategy(portalId: string): Observable<UrlStrategy> {
    return this.http.get<ApiResponse<UrlStrategy>>(`${this.base}/portals/${portalId}/url-strategy`)
        .pipe(map(r => r.data));
  }

  saveUrlStrategy(portalId: string, strategy: Partial<UrlStrategy>): Observable<UrlStrategy> {
    return this.http.post<ApiResponse<UrlStrategy>>(`${this.base}/portals/${portalId}/url-strategy`, strategy)
        .pipe(map(r => r.data));
  }

  // ===== FIELD SELECTORS =====

  getSelectors(portalId: string, context?: string): Observable<FieldSelector[]> {
    let params = new HttpParams();
    if (context) params = params.set('context', context);
    return this.http.get<ApiResponse<FieldSelector[]>>(`${this.base}/portals/${portalId}/selectors`, { params })
        .pipe(map(r => r.data));
  }

  addSelector(portalId: string, selector: Partial<FieldSelector>): Observable<FieldSelector> {
    return this.http.post<ApiResponse<FieldSelector>>(`${this.base}/portals/${portalId}/selectors`, selector)
        .pipe(map(r => r.data));
  }

  updateSelector(portalId: string, selectorId: string, selector: Partial<FieldSelector>): Observable<FieldSelector> {
    return this.http.put<ApiResponse<FieldSelector>>(`${this.base}/portals/${portalId}/selectors/${selectorId}`, selector)
        .pipe(map(r => r.data));
  }

  deleteSelector(portalId: string, selectorId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/portals/${portalId}/selectors/${selectorId}`)
        .pipe(map(() => undefined));
  }

  reorderSelectors(portalId: string, orderedIds: string[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/portals/${portalId}/selectors/reorder`, orderedIds)
        .pipe(map(() => undefined));
  }

  // ===== PIPELINE =====

  getPipeline(portalId: string): Observable<{ pipelineNodes: ActionNode[] }> {
    return this.http.get<ApiResponse<{ pipelineNodes: ActionNode[] }>>(`${this.base}/portals/${portalId}/pipeline`)
        .pipe(map(r => r.data));
  }

  savePipeline(portalId: string, nodes: ActionNode[]): Observable<{ pipelineNodes: ActionNode[] }> {
    return this.http.put<ApiResponse<{ pipelineNodes: ActionNode[] }>>(
        `${this.base}/portals/${portalId}/pipeline`, { pipelineNodes: nodes }
    ).pipe(map(r => r.data));
  }

  // ===== SCOPE =====

  getScope(portalId: string): Observable<{ targetCities: string[]; targetLocalities: string[] }> {
    return this.http.get<ApiResponse<any>>(`${this.base}/portals/${portalId}/scope`)
        .pipe(map(r => r.data));
  }

  updateScope(portalId: string, scope: { targetCities: string[]; targetLocalities: string[] }): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.base}/portals/${portalId}/scope`, scope)
        .pipe(map(r => r.data));
  }
}
