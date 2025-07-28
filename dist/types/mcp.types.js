import { z } from 'zod';
// MCP Tool Schemas
export const GetEventsSchema = z.object({
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD format)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD format)'),
    event_name: z.string().optional().describe('Specific event name to filter'),
    limit: z.number().min(1).max(1000).default(100).describe('Number of events to return'),
    distinct_id: z.string().optional().describe('Filter by specific user ID'),
});
export const GetInsightsSchema = z.object({
    name: z.string().optional().describe('Filter insights by name'),
    limit: z.number().min(1).max(100).default(20).describe('Number of insights to return'),
});
export const CreateInsightSchema = z.object({
    name: z.string().describe('Name for the insight'),
    description: z.string().optional().describe('Description of the insight'),
    events: z.array(z.string()).describe('Array of event names to analyze'),
    date_from: z.string().optional().describe('Start date for analysis'),
    date_to: z.string().optional().describe('End date for analysis'),
    breakdown: z.string().optional().describe('Property to breakdown by'),
});
export const GetCohortsSchema = z.object({
    limit: z.number().min(1).max(100).default(20).describe('Number of cohorts to return'),
});
export const GetPersonsSchema = z.object({
    limit: z.number().min(1).max(1000).default(100).describe('Number of persons to return'),
    search: z.string().optional().describe('Search term for person properties'),
});
export const GetFeatureFlagsSchema = z.object({
    active_only: z.boolean().default(false).describe('Return only active feature flags'),
});
export const AnalyzeUserJourneySchema = z.object({
    distinct_id: z.string().describe('User ID to analyze'),
    date_from: z.string().optional().describe('Start date for analysis'),
    date_to: z.string().optional().describe('End date for analysis'),
});
export const GetMetricsSchema = z.object({
    date_from: z.string().optional().describe('Start date for metrics'),
    date_to: z.string().optional().describe('End date for metrics'),
    events: z.array(z.string()).optional().describe('Specific events to include in metrics'),
});
export const QueryDataSchema = z.object({
    query: z.string().describe('Natural language query about the data'),
    date_from: z.string().optional().describe('Start date for the query'),
    date_to: z.string().optional().describe('End date for the query'),
    limit: z.number().min(1).max(1000).default(100).describe('Number of results to return'),
});
export const GetSessionRecordingsSchema = z.object({
    distinct_id: z.string().optional().describe('Filter by specific user ID'),
    date_from: z.string().optional().describe('Start date for recordings'),
    date_to: z.string().optional().describe('End date for recordings'),
    limit: z.number().min(1).max(100).default(20).describe('Number of recordings to return'),
});
