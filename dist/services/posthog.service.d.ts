import { PostHogConfig, PostHogEvent, PostHogPerson, PostHogInsight, PostHogCohort, PostHogFeatureFlag, PostHogSessionRecording, PostHogQueryParams, PostHogMetrics } from "../types/posthog.types.js";
export declare class PostHogService {
    private client;
    private apiClient;
    private config;
    constructor(config: PostHogConfig);
    /**
     * Get events with optional filtering
     */
    getEvents(params?: PostHogQueryParams): Promise<PostHogEvent[]>;
    /**
     * Get specific event by name
     */
    getEventsByName(eventName: string, params?: PostHogQueryParams): Promise<PostHogEvent[]>;
    /**
     * Get persons/users
     */
    getPersons(limit?: number, search?: string): Promise<PostHogPerson[]>;
    /**
     * Get insights
     */
    getInsights(limit?: number, name?: string): Promise<PostHogInsight[]>;
    /**
     * Create a new insight
     */
    createInsight(insight: Partial<PostHogInsight>): Promise<PostHogInsight>;
    /**
     * Get cohorts
     */
    getCohorts(limit?: number): Promise<PostHogCohort[]>;
    /**
     * Get feature flags
     */
    getFeatureFlags(activeOnly?: boolean): Promise<PostHogFeatureFlag[]>;
    /**
     * Get session recordings
     */
    getSessionRecordings(params?: {
        distinct_id?: string;
        date_from?: string;
        date_to?: string;
        limit?: number;
    }): Promise<PostHogSessionRecording[]>;
    /**
     * Get user journey for a specific user
     */
    getUserJourney(distinctId: string, dateFrom?: string, dateTo?: string): Promise<PostHogEvent[]>;
    /**
     * Get high-level metrics
     */
    getMetrics(params?: PostHogQueryParams): Promise<PostHogMetrics>;
    /**
     * Track an event (for testing purposes)
     */
    trackEvent(distinctId: string, event: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Health check for the PostHog connection
     */
    healthCheck(): Promise<boolean>;
    /**
     * Cleanup resources
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=posthog.service.d.ts.map