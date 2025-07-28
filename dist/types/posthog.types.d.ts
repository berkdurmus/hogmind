export interface PostHogConfig {
    apiKey: string;
    host: string;
    projectId: string;
}
export interface PostHogEvent {
    id: string;
    event: string;
    timestamp: string;
    distinct_id: string;
    properties: Record<string, any>;
    person?: PostHogPerson;
}
export interface PostHogPerson {
    id: string;
    name?: string;
    distinct_ids: string[];
    properties: Record<string, any>;
    created_at: string;
}
export interface PostHogInsight {
    id: string;
    name: string;
    description?: string;
    filters: {
        events?: Array<{
            id: string;
            name: string;
            type: string;
            properties?: Record<string, any>;
        }>;
        properties?: Record<string, any>;
        date_from?: string;
        date_to?: string;
    };
    result?: InsightResult[];
    created_at: string;
    updated_at: string;
}
export interface InsightResult {
    action: {
        id: string;
        name: string;
    };
    count: number;
    data: number[];
    labels: string[];
    days: string[];
}
export interface PostHogCohort {
    id: string;
    name: string;
    description?: string;
    groups: Array<{
        properties: Array<{
            key: string;
            value: any;
            operator: string;
            type: string;
        }>;
    }>;
    count?: number;
    created_at: string;
}
export interface PostHogFeatureFlag {
    id: string;
    name: string;
    key: string;
    filters: {
        groups: Array<{
            properties: any[];
            rollout_percentage?: number;
        }>;
        multivariate?: {
            variants: Array<{
                key: string;
                name?: string;
                rollout_percentage: number;
            }>;
        };
    };
    active: boolean;
    created_at: string;
}
export interface PostHogAnnotation {
    id: string;
    content: string;
    date_marker: string;
    created_at: string;
    updated_at: string;
    created_by?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}
export interface PostHogSessionRecording {
    id: string;
    distinct_id: string;
    duration: number;
    start_time: string;
    end_time: string;
    click_count: number;
    keypress_count: number;
    mouse_activity_count: number;
    active_seconds: number;
}
export interface PostHogMetrics {
    total_events: number;
    unique_users: number;
    sessions: number;
    avg_session_duration: number;
    bounce_rate: number;
    retention_rate: number;
}
export interface PostHogQueryParams {
    date_from?: string;
    date_to?: string;
    events?: string[];
    properties?: Record<string, any>;
    breakdown?: string;
    limit?: number;
    offset?: number;
}
export interface PostHogApiResponse<T> {
    results: T[];
    next?: string;
    previous?: string;
    count?: number;
}
//# sourceMappingURL=posthog.types.d.ts.map