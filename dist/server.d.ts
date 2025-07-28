import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { PostHogConfig } from "./types/posthog.types.js";
export declare class HogMindServer {
    private server;
    private postHogService;
    constructor(config: PostHogConfig);
    private setupHandlers;
    private handleGetEvents;
    private handleGetInsights;
    private handleCreateInsight;
    private handleGetCohorts;
    private handleGetPersons;
    private handleGetFeatureFlags;
    private handleAnalyzeUserJourney;
    private handleGetMetrics;
    private handleQueryData;
    private handleGetSessionRecordings;
    start(transport: any): Promise<Server<{
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
                progressToken?: string | number | undefined;
            } | undefined;
        } | undefined;
    }, {
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
            } | undefined;
        } | undefined;
    }, {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    }>>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map