import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { PostHogService } from "./services/posthog.service.js";
import { GetEventsSchema, GetInsightsSchema, CreateInsightSchema, GetCohortsSchema, GetPersonsSchema, GetFeatureFlagsSchema, AnalyzeUserJourneySchema, GetMetricsSchema, QueryDataSchema, GetSessionRecordingsSchema, } from "./types/mcp.types.js";
import { formatDistanceToNow, parseISO } from "date-fns";
import _ from "lodash";
export class HogMindServer {
    server;
    postHogService;
    constructor(config) {
        this.server = new Server({
            name: "hogmind",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
                resources: {},
                logging: {},
            },
        });
        this.postHogService = new PostHogService(config);
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "get_events",
                        description: "Retrieve PostHog events with optional filtering by date, event name, or user",
                        inputSchema: GetEventsSchema,
                    },
                    {
                        name: "get_insights",
                        description: "Get existing PostHog insights and their results",
                        inputSchema: GetInsightsSchema,
                    },
                    {
                        name: "create_insight",
                        description: "Create a new PostHog insight for event analysis",
                        inputSchema: CreateInsightSchema,
                    },
                    {
                        name: "get_cohorts",
                        description: "Retrieve user cohorts and their definitions",
                        inputSchema: GetCohortsSchema,
                    },
                    {
                        name: "get_persons",
                        description: "Get user/person data with optional search",
                        inputSchema: GetPersonsSchema,
                    },
                    {
                        name: "get_feature_flags",
                        description: "Retrieve feature flags and their configurations",
                        inputSchema: GetFeatureFlagsSchema,
                    },
                    {
                        name: "analyze_user_journey",
                        description: "Analyze the complete journey of a specific user",
                        inputSchema: AnalyzeUserJourneySchema,
                    },
                    {
                        name: "get_metrics",
                        description: "Get high-level analytics metrics and KPIs",
                        inputSchema: GetMetricsSchema,
                    },
                    {
                        name: "query_data",
                        description: "Query PostHog data using natural language (AI-powered analysis)",
                        inputSchema: QueryDataSchema,
                    },
                    {
                        name: "get_session_recordings",
                        description: "Retrieve session recordings with optional filtering",
                        inputSchema: GetSessionRecordingsSchema,
                    },
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                let result;
                switch (name) {
                    case "get_events":
                        result = await this.handleGetEvents(args);
                        break;
                    case "get_insights":
                        result = await this.handleGetInsights(args);
                        break;
                    case "create_insight":
                        result = await this.handleCreateInsight(args);
                        break;
                    case "get_cohorts":
                        result = await this.handleGetCohorts(args);
                        break;
                    case "get_persons":
                        result = await this.handleGetPersons(args);
                        break;
                    case "get_feature_flags":
                        result = await this.handleGetFeatureFlags(args);
                        break;
                    case "analyze_user_journey":
                        result = await this.handleAnalyzeUserJourney(args);
                        break;
                    case "get_metrics":
                        result = await this.handleGetMetrics(args);
                        break;
                    case "query_data":
                        result = await this.handleQueryData(args);
                        break;
                    case "get_session_recordings":
                        result = await this.handleGetSessionRecordings(args);
                        break;
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
                // Return the result directly as per MCP specification
                return result;
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        });
        // Add resource handlers for complete MCP support
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: "posthog://events/recent",
                        name: "Recent Events",
                        description: "Most recent PostHog events",
                        mimeType: "application/json",
                    },
                    {
                        uri: "posthog://insights/dashboard",
                        name: "Dashboard Insights",
                        description: "Current dashboard insights",
                        mimeType: "application/json",
                    },
                ],
            };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            switch (uri) {
                case "posthog://events/recent":
                    const recentEvents = await this.postHogService.getEvents({
                        limit: 10,
                    });
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: "application/json",
                                text: JSON.stringify(recentEvents, null, 2),
                            },
                        ],
                    };
                case "posthog://insights/dashboard":
                    const insights = await this.postHogService.getInsights(5);
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: "application/json",
                                text: JSON.stringify(insights, null, 2),
                            },
                        ],
                    };
                default:
                    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
            }
        });
    }
    async handleGetEvents(args) {
        const params = GetEventsSchema.parse(args);
        try {
            let events;
            if (params.event_name) {
                events = await this.postHogService.getEventsByName(params.event_name, {
                    date_from: params.date_from,
                    date_to: params.date_to,
                    limit: params.limit,
                });
            }
            else {
                events = await this.postHogService.getEvents({
                    date_from: params.date_from,
                    date_to: params.date_to,
                    limit: params.limit,
                });
            }
            if (params.distinct_id) {
                events = events.filter((e) => e.distinct_id === params.distinct_id);
            }
            return {
                success: true,
                data: events,
                message: `Retrieved ${events.length} events`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetInsights(args) {
        const params = GetInsightsSchema.parse(args);
        try {
            const insights = await this.postHogService.getInsights(params.limit, params.name);
            return {
                success: true,
                data: insights,
                message: `Retrieved ${insights.length} insights`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleCreateInsight(args) {
        const params = CreateInsightSchema.parse(args);
        try {
            const insight = await this.postHogService.createInsight({
                name: params.name,
                description: params.description,
                filters: {
                    events: params.events.map((event) => ({
                        id: event,
                        name: event,
                        type: "events",
                    })),
                    date_from: params.date_from,
                    date_to: params.date_to,
                },
            });
            return {
                success: true,
                data: insight,
                message: `Created insight: ${insight.name}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetCohorts(args) {
        const params = GetCohortsSchema.parse(args);
        try {
            const cohorts = await this.postHogService.getCohorts(params.limit);
            return {
                success: true,
                data: cohorts,
                message: `Retrieved ${cohorts.length} cohorts`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetPersons(args) {
        const params = GetPersonsSchema.parse(args);
        try {
            const persons = await this.postHogService.getPersons(params.limit, params.search);
            return {
                success: true,
                data: persons,
                message: `Retrieved ${persons.length} persons`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetFeatureFlags(args) {
        const params = GetFeatureFlagsSchema.parse(args);
        try {
            const featureFlags = await this.postHogService.getFeatureFlags(params.active_only);
            return {
                success: true,
                data: featureFlags,
                message: `Retrieved ${featureFlags.length} feature flags`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleAnalyzeUserJourney(args) {
        const params = AnalyzeUserJourneySchema.parse(args);
        try {
            const events = await this.postHogService.getUserJourney(params.distinct_id, params.date_from, params.date_to);
            if (events.length === 0) {
                return {
                    success: true,
                    data: null,
                    message: `No events found for user ${params.distinct_id}`,
                };
            }
            // Analyze the journey
            const eventGroups = _.groupBy(events, "event");
            const keyEvents = Object.entries(eventGroups).map(([event, eventList]) => ({
                event,
                count: eventList.length,
                first_occurrence: eventList[0].timestamp,
                last_occurrence: eventList[eventList.length - 1].timestamp,
            }));
            // Generate insights
            const insights = [];
            const totalEvents = events.length;
            const uniqueEvents = Object.keys(eventGroups).length;
            insights.push(`User performed ${totalEvents} events across ${uniqueEvents} different event types`);
            insights.push(`Time span: ${formatDistanceToNow(parseISO(events[0].timestamp))} ago to ${formatDistanceToNow(parseISO(events[events.length - 1].timestamp))} ago`);
            if (totalEvents > 10) {
                insights.push("High engagement user - performed many actions");
            }
            else if (totalEvents < 3) {
                insights.push("Low engagement - may need attention or onboarding");
            }
            const analysis = {
                user_id: params.distinct_id,
                total_events: totalEvents,
                session_count: Math.ceil(totalEvents / 10), // Simplified estimation
                first_seen: events[0].timestamp,
                last_seen: events[events.length - 1].timestamp,
                key_events: _.orderBy(keyEvents, "count", "desc"),
                insights,
            };
            return {
                success: true,
                data: analysis,
                message: `Analyzed journey for user ${params.distinct_id}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetMetrics(args) {
        const params = GetMetricsSchema.parse(args);
        try {
            const metrics = await this.postHogService.getMetrics({
                date_from: params.date_from,
                date_to: params.date_to,
            });
            // Get events for trend analysis
            const events = await this.postHogService.getEvents({
                date_from: params.date_from,
                date_to: params.date_to,
                limit: 10000,
            });
            // Analyze top events
            const eventGroups = _.groupBy(events, "event");
            const topEvents = Object.entries(eventGroups)
                .map(([event, eventList]) => ({
                event,
                count: eventList.length,
                unique_users: new Set(eventList.map((e) => e.distinct_id)).size,
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            // Generate daily trends (simplified)
            const dailyEvents = _.groupBy(events, (event) => new Date(event.timestamp).toISOString().split("T")[0]);
            const trends = Object.entries(dailyEvents).map(([date, dayEvents]) => ({
                date,
                events: dayEvents.length,
                users: new Set(dayEvents.map((e) => e.distinct_id))
                    .size,
            }));
            const insights = [];
            insights.push(`Total of ${metrics.total_events} events from ${metrics.unique_users} unique users`);
            insights.push(`Average session duration: ${Math.round(metrics.avg_session_duration / 60)} minutes`);
            if (topEvents.length > 0) {
                insights.push(`Most popular event: "${topEvents[0].event}" with ${topEvents[0].count} occurrences`);
            }
            const analysis = {
                period: {
                    start: params.date_from || "N/A",
                    end: params.date_to || "N/A",
                },
                overview: {
                    total_events: metrics.total_events,
                    unique_users: metrics.unique_users,
                    sessions: metrics.sessions,
                    avg_session_duration: metrics.avg_session_duration,
                },
                top_events: topEvents,
                trends: _.orderBy(trends, "date"),
                insights,
            };
            return {
                success: true,
                data: analysis,
                message: `Generated metrics analysis`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleQueryData(args) {
        const params = QueryDataSchema.parse(args);
        try {
            // This is a simplified implementation of natural language querying
            // In a real implementation, you'd use an LLM to parse the query and generate appropriate API calls
            const query = params.query.toLowerCase();
            let result = null;
            let message = "";
            if (query.includes("event") && query.includes("count")) {
                const events = await this.postHogService.getEvents({
                    date_from: params.date_from,
                    date_to: params.date_to,
                    limit: params.limit,
                });
                const eventCounts = _.groupBy(events, "event");
                result = Object.entries(eventCounts).map(([event, eventList]) => ({
                    event,
                    count: eventList.length,
                }));
                message = "Event counts analysis";
            }
            else if (query.includes("user") &&
                (query.includes("active") || query.includes("engagement"))) {
                const metrics = await this.postHogService.getMetrics({
                    date_from: params.date_from,
                    date_to: params.date_to,
                });
                result = {
                    unique_users: metrics.unique_users,
                    avg_session_duration: metrics.avg_session_duration,
                    total_events: metrics.total_events,
                };
                message = "User engagement analysis";
            }
            else if (query.includes("popular") || query.includes("top")) {
                const events = await this.postHogService.getEvents({
                    date_from: params.date_from,
                    date_to: params.date_to,
                    limit: params.limit,
                });
                const eventGroups = _.groupBy(events, "event");
                result = Object.entries(eventGroups)
                    .map(([event, eventList]) => ({
                    event,
                    count: eventList.length,
                }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
                message = "Popular events analysis";
            }
            else {
                // Default: return recent events
                result = await this.postHogService.getEvents({
                    date_from: params.date_from,
                    date_to: params.date_to,
                    limit: Math.min(params.limit, 50),
                });
                message = "Recent events (default query response)";
            }
            return {
                success: true,
                data: result,
                message: `Query analysis: ${message}`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async handleGetSessionRecordings(args) {
        const params = GetSessionRecordingsSchema.parse(args);
        try {
            const recordings = await this.postHogService.getSessionRecordings({
                distinct_id: params.distinct_id,
                date_from: params.date_from,
                date_to: params.date_to,
                limit: params.limit,
            });
            return {
                success: true,
                data: recordings,
                message: `Retrieved ${recordings.length} session recordings`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async start(transport) {
        // Health check
        const isHealthy = await this.postHogService.healthCheck();
        if (!isHealthy) {
            throw new Error("PostHog connection failed during startup");
        }
        // Connect to transport (stdio or HTTP)
        await this.server.connect(transport);
        console.log("HogMind MCP Server started successfully");
        return this.server;
    }
    async shutdown() {
        await this.postHogService.shutdown();
        console.log("HogMind MCP Server shut down");
    }
}
