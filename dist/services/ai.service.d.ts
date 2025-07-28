import { PostHogEvent, PostHogInsight } from "../types/posthog.types.js";
import { InsightAnalysis } from "../types/mcp.types.js";
export declare class AIService {
    /**
     * Analyze events and generate intelligent insights
     */
    static analyzeEvents(events: PostHogEvent[]): InsightAnalysis;
    /**
     * Parse natural language queries and suggest PostHog API calls
     */
    static parseNaturalLanguageQuery(query: string): {
        intent: string;
        entities: string[];
        suggestedAction: string;
        parameters: Record<string, any>;
    };
    /**
     * Generate insights about user behavior patterns
     */
    static analyzeUserBehavior(events: PostHogEvent[]): {
        patterns: Array<{
            pattern: string;
            confidence: number;
            description: string;
        }>;
        segments: Array<{
            name: string;
            criteria: string;
            userCount: number;
        }>;
    };
    /**
     * Suggest optimizations based on data analysis
     */
    static generateOptimizationSuggestions(events: PostHogEvent[], insights: PostHogInsight[]): Array<{
        category: string;
        priority: "high" | "medium" | "low";
        suggestion: string;
        expectedImpact: string;
    }>;
    private static getTimeRange;
    private static calculateTimeSpan;
    private static generateRecommendations;
}
//# sourceMappingURL=ai.service.d.ts.map