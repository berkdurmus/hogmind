import { z } from 'zod';
export declare const GetEventsSchema: z.ZodObject<{
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    event_name: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    distinct_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    date_from?: string | undefined;
    date_to?: string | undefined;
    distinct_id?: string | undefined;
    event_name?: string | undefined;
}, {
    date_from?: string | undefined;
    date_to?: string | undefined;
    limit?: number | undefined;
    distinct_id?: string | undefined;
    event_name?: string | undefined;
}>;
export declare const GetInsightsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    name?: string | undefined;
}, {
    limit?: number | undefined;
    name?: string | undefined;
}>;
export declare const CreateInsightSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    events: z.ZodArray<z.ZodString, "many">;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    breakdown: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    events: string[];
    date_from?: string | undefined;
    date_to?: string | undefined;
    description?: string | undefined;
    breakdown?: string | undefined;
}, {
    name: string;
    events: string[];
    date_from?: string | undefined;
    date_to?: string | undefined;
    description?: string | undefined;
    breakdown?: string | undefined;
}>;
export declare const GetCohortsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
}, {
    limit?: number | undefined;
}>;
export declare const GetPersonsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    search?: string | undefined;
}>;
export declare const GetFeatureFlagsSchema: z.ZodObject<{
    active_only: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    active_only: boolean;
}, {
    active_only?: boolean | undefined;
}>;
export declare const AnalyzeUserJourneySchema: z.ZodObject<{
    distinct_id: z.ZodString;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    distinct_id: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
}, {
    distinct_id: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
}>;
export declare const GetMetricsSchema: z.ZodObject<{
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    date_from?: string | undefined;
    date_to?: string | undefined;
    events?: string[] | undefined;
}, {
    date_from?: string | undefined;
    date_to?: string | undefined;
    events?: string[] | undefined;
}>;
export declare const QueryDataSchema: z.ZodObject<{
    query: z.ZodString;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
}, {
    query: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
    limit?: number | undefined;
}>;
export declare const GetSessionRecordingsSchema: z.ZodObject<{
    distinct_id: z.ZodOptional<z.ZodString>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    date_from?: string | undefined;
    date_to?: string | undefined;
    distinct_id?: string | undefined;
}, {
    date_from?: string | undefined;
    date_to?: string | undefined;
    limit?: number | undefined;
    distinct_id?: string | undefined;
}>;
export interface ToolResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}
export interface InsightAnalysis {
    summary: string;
    trends: Array<{
        metric: string;
        change: number;
        direction: 'up' | 'down' | 'stable';
        significance: 'high' | 'medium' | 'low';
    }>;
    recommendations: string[];
}
export interface UserJourneyAnalysis {
    user_id: string;
    total_events: number;
    session_count: number;
    first_seen: string;
    last_seen: string;
    key_events: Array<{
        event: string;
        count: number;
        first_occurrence: string;
        last_occurrence: string;
    }>;
    funnel_analysis?: {
        stages: Array<{
            event: string;
            users: number;
            conversion_rate: number;
        }>;
    };
    insights: string[];
}
export interface MetricsAnalysis {
    period: {
        start: string;
        end: string;
    };
    overview: {
        total_events: number;
        unique_users: number;
        sessions: number;
        avg_session_duration: number;
    };
    top_events: Array<{
        event: string;
        count: number;
        unique_users: number;
    }>;
    trends: Array<{
        date: string;
        events: number;
        users: number;
    }>;
    insights: string[];
}
export type GetEventsParams = z.infer<typeof GetEventsSchema>;
export type GetInsightsParams = z.infer<typeof GetInsightsSchema>;
export type CreateInsightParams = z.infer<typeof CreateInsightSchema>;
export type GetCohortsParams = z.infer<typeof GetCohortsSchema>;
export type GetPersonsParams = z.infer<typeof GetPersonsSchema>;
export type GetFeatureFlagsParams = z.infer<typeof GetFeatureFlagsSchema>;
export type AnalyzeUserJourneyParams = z.infer<typeof AnalyzeUserJourneySchema>;
export type GetMetricsParams = z.infer<typeof GetMetricsSchema>;
export type QueryDataParams = z.infer<typeof QueryDataSchema>;
export type GetSessionRecordingsParams = z.infer<typeof GetSessionRecordingsSchema>;
//# sourceMappingURL=mcp.types.d.ts.map