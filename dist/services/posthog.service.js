import { PostHog } from "posthog-node";
import axios from "axios";
export class PostHogService {
    client;
    apiClient;
    config;
    constructor(config) {
        this.config = config;
        this.client = new PostHog(config.apiKey, {
            host: config.host,
        });
        this.apiClient = axios.create({
            baseURL: `${config.host}/api`,
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
            },
        });
    }
    /**
     * Get events with optional filtering
     */
    async getEvents(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.date_from)
                queryParams.set("date_from", params.date_from);
            if (params.date_to)
                queryParams.set("date_to", params.date_to);
            if (params.limit)
                queryParams.set("limit", params.limit.toString());
            if (params.offset)
                queryParams.set("offset", params.offset.toString());
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/events/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching events:", error);
            throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get specific event by name
     */
    async getEventsByName(eventName, params = {}) {
        try {
            const events = await this.getEvents(params);
            return events.filter((event) => event.event === eventName);
        }
        catch (error) {
            console.error("Error fetching events by name:", error);
            throw new Error(`Failed to fetch events for ${eventName}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get persons/users
     */
    async getPersons(limit = 100, search) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("limit", limit.toString());
            if (search)
                queryParams.set("search", search);
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/persons/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching persons:", error);
            throw new Error(`Failed to fetch persons: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get insights
     */
    async getInsights(limit = 20, name) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("limit", limit.toString());
            if (name)
                queryParams.set("search", name);
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/insights/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching insights:", error);
            throw new Error(`Failed to fetch insights: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Create a new insight
     */
    async createInsight(insight) {
        try {
            const response = await this.apiClient.post(`/projects/${this.config.projectId}/insights/`, insight);
            return response.data;
        }
        catch (error) {
            console.error("Error creating insight:", error);
            throw new Error(`Failed to create insight: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get cohorts
     */
    async getCohorts(limit = 20) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("limit", limit.toString());
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/cohorts/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching cohorts:", error);
            throw new Error(`Failed to fetch cohorts: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get feature flags
     */
    async getFeatureFlags(activeOnly = false) {
        try {
            const queryParams = new URLSearchParams();
            if (activeOnly)
                queryParams.set("active", "true");
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/feature_flags/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching feature flags:", error);
            throw new Error(`Failed to fetch feature flags: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get session recordings
     */
    async getSessionRecordings(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.distinct_id)
                queryParams.set("distinct_id", params.distinct_id);
            if (params.date_from)
                queryParams.set("date_from", params.date_from);
            if (params.date_to)
                queryParams.set("date_to", params.date_to);
            if (params.limit)
                queryParams.set("limit", params.limit.toString());
            const response = await this.apiClient.get(`/projects/${this.config.projectId}/session_recordings/?${queryParams.toString()}`);
            return response.data.results;
        }
        catch (error) {
            console.error("Error fetching session recordings:", error);
            throw new Error(`Failed to fetch session recordings: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get user journey for a specific user
     */
    async getUserJourney(distinctId, dateFrom, dateTo) {
        try {
            const params = {
                date_from: dateFrom,
                date_to: dateTo,
                limit: 1000,
            };
            const events = await this.getEvents(params);
            return events
                .filter((event) => event.distinct_id === distinctId)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        catch (error) {
            console.error("Error fetching user journey:", error);
            throw new Error(`Failed to fetch user journey: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get high-level metrics
     */
    async getMetrics(params = {}) {
        try {
            const events = await this.getEvents({ ...params, limit: 10000 });
            // Calculate metrics
            const uniqueUsers = new Set(events.map((e) => e.distinct_id)).size;
            const totalEvents = events.length;
            // Group events by session (simplified - events within 30 minutes)
            const sessionEvents = events.reduce((sessions, event) => {
                const key = `${event.distinct_id}_${Math.floor(new Date(event.timestamp).getTime() / (30 * 60 * 1000))}`;
                if (!sessions[key])
                    sessions[key] = [];
                sessions[key].push(event);
                return sessions;
            }, {});
            const sessions = Object.keys(sessionEvents).length;
            // Calculate average session duration (simplified)
            const avgSessionDuration = sessions > 0
                ? Object.values(sessionEvents).reduce((total, sessionEvents) => {
                    if (sessionEvents.length < 2)
                        return total;
                    const duration = new Date(sessionEvents[sessionEvents.length - 1].timestamp).getTime() - new Date(sessionEvents[0].timestamp).getTime();
                    return total + duration;
                }, 0) /
                    sessions /
                    1000
                : 0; // Convert to seconds
            return {
                total_events: totalEvents,
                unique_users: uniqueUsers,
                sessions,
                avg_session_duration: Math.round(avgSessionDuration),
                bounce_rate: 0, // Would need more complex calculation
                retention_rate: 0, // Would need more complex calculation
            };
        }
        catch (error) {
            console.error("Error calculating metrics:", error);
            throw new Error(`Failed to calculate metrics: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Track an event (for testing purposes)
     */
    async trackEvent(distinctId, event, properties) {
        try {
            this.client.capture({
                distinctId,
                event,
                properties,
            });
            await this.client.flush();
        }
        catch (error) {
            console.error("Error tracking event:", error);
            throw new Error(`Failed to track event: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Health check for the PostHog connection
     */
    async healthCheck() {
        try {
            await this.apiClient.get(`/projects/${this.config.projectId}/`);
            return true;
        }
        catch (error) {
            console.error("PostHog health check failed:", error);
            return false;
        }
    }
    /**
     * Cleanup resources
     */
    async shutdown() {
        try {
            await this.client.shutdown();
        }
        catch (error) {
            console.error("Error shutting down PostHog client:", error);
        }
    }
}
