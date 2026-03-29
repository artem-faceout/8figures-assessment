import type { components } from './api.generated';

// Re-export server types for dashboard & asset detail
export type ApiPricePoint = components['schemas']['PricePoint'];
export type ApiPriceHistory = components['schemas']['PriceHistory'];
export type ApiPortfolioInsight = components['schemas']['PortfolioInsight'];
export type ApiAssetMetrics = components['schemas']['AssetMetrics'];
export type ApiTimeRange = components['schemas']['TimeRange'];
export interface ApiResponse<T> { data: T; meta?: { timestamp?: string } }
