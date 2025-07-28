import { PostHogEvent, PostHogInsight } from "../types/posthog.types.js";
import { InsightAnalysis } from "../types/mcp.types.js";
import _ from "lodash";
import { differenceInDays, parseISO } from "date-fns";

export class AIService {
  /**
   * Analyze events and generate intelligent insights
   */
  static analyzeEvents(events: PostHogEvent[]): InsightAnalysis {
    if (events.length === 0) {
      return {
        summary: "No events found for analysis",
        trends: [],
        recommendations: ["Increase user engagement to generate more events"],
      };
    }

    const eventGroups = _.groupBy(events, "event");
    const userGroups = _.groupBy(events, "distinct_id");
    const timeRange = this.getTimeRange(events);

    // Calculate trends
    const trends = Object.entries(eventGroups).map(([event, eventList]) => {
      const previousCount = Math.max(1, (eventList as any[]).length * 0.8); // Simulate previous period
      const change =
        (((eventList as any[]).length - previousCount) / previousCount) * 100;

      return {
        metric: event,
        change: Math.round(change),
        direction:
          change > 5
            ? ("up" as const)
            : change < -5
              ? ("down" as const)
              : ("stable" as const),
        significance:
          Math.abs(change) > 20
            ? ("high" as const)
            : Math.abs(change) > 10
              ? ("medium" as const)
              : ("low" as const),
      };
    });

    // Generate summary
    const totalEvents = events.length;
    const uniqueUsers = Object.keys(userGroups).length;
    const uniqueEventTypes = Object.keys(eventGroups).length;
    const avgEventsPerUser = Math.round(totalEvents / uniqueUsers);

    const summary =
      `Analyzed ${totalEvents} events across ${uniqueEventTypes} event types from ${uniqueUsers} unique users. ` +
      `Average of ${avgEventsPerUser} events per user over ${timeRange}.`;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      events,
      eventGroups,
      userGroups,
      trends
    );

    return {
      summary,
      trends: _.orderBy(trends, ["significance", "change"], ["desc", "desc"]),
      recommendations,
    };
  }

  /**
   * Parse natural language queries and suggest PostHog API calls
   */
  static parseNaturalLanguageQuery(query: string): {
    intent: string;
    entities: string[];
    suggestedAction: string;
    parameters: Record<string, any>;
  } {
    const lowerQuery = query.toLowerCase();
    const entities: string[] = [];
    let intent = "unknown";
    let suggestedAction = "get_events";
    const parameters: Record<string, any> = {};

    // Extract date ranges
    const dateMatches = lowerQuery.match(
      /(?:last|past)\s+(\d+)\s+(day|week|month)s?/
    );
    if (dateMatches) {
      const amount = parseInt(dateMatches[1]);
      const unit = dateMatches[2];

      const date = new Date();
      if (unit === "day") {
        date.setDate(date.getDate() - amount);
      } else if (unit === "week") {
        date.setDate(date.getDate() - amount * 7);
      } else if (unit === "month") {
        date.setMonth(date.getMonth() - amount);
      }

      parameters.date_from = date.toISOString().split("T")[0];
      entities.push(`${amount} ${unit}${amount > 1 ? "s" : ""}`);
    }

    // Identify intent based on keywords
    if (
      lowerQuery.includes("user") &&
      (lowerQuery.includes("journey") || lowerQuery.includes("behavior"))
    ) {
      intent = "user_journey";
      suggestedAction = "analyze_user_journey";

      // Look for user IDs
      const userIdMatch = lowerQuery.match(/user\s+([a-zA-Z0-9_-]+)/);
      if (userIdMatch) {
        parameters.distinct_id = userIdMatch[1];
        entities.push(`user: ${userIdMatch[1]}`);
      }
    } else if (
      lowerQuery.includes("metric") ||
      lowerQuery.includes("kpi") ||
      lowerQuery.includes("overview")
    ) {
      intent = "metrics";
      suggestedAction = "get_metrics";
    } else if (lowerQuery.includes("event") && lowerQuery.includes("count")) {
      intent = "event_analysis";
      suggestedAction = "get_events";

      // Look for specific event names
      const eventMatch = lowerQuery.match(/event\s+"([^"]+)"/);
      if (eventMatch) {
        parameters.event_name = eventMatch[1];
        entities.push(`event: ${eventMatch[1]}`);
      }
    } else if (lowerQuery.includes("popular") || lowerQuery.includes("top")) {
      intent = "popular_events";
      suggestedAction = "query_data";
      parameters.query = "top events by count";
    } else if (lowerQuery.includes("cohort")) {
      intent = "cohort_analysis";
      suggestedAction = "get_cohorts";
    } else if (
      lowerQuery.includes("feature flag") ||
      lowerQuery.includes("flag")
    ) {
      intent = "feature_flags";
      suggestedAction = "get_feature_flags";
    } else if (
      lowerQuery.includes("recording") ||
      lowerQuery.includes("session")
    ) {
      intent = "session_analysis";
      suggestedAction = "get_session_recordings";
    }

    return {
      intent,
      entities,
      suggestedAction,
      parameters,
    };
  }

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
  } {
    const userGroups = _.groupBy(events, "distinct_id");
    const patterns: Array<{
      pattern: string;
      confidence: number;
      description: string;
    }> = [];
    const segments: Array<{
      name: string;
      criteria: string;
      userCount: number;
    }> = [];

    // Analyze event frequency patterns
    const userEventCounts = Object.entries(userGroups).map(
      ([userId, userEvents]) => ({
        userId,
        eventCount: userEvents.length,
        uniqueEvents: new Set(userEvents.map((e) => e.event)).size,
        timeSpan: this.calculateTimeSpan(userEvents),
      })
    );

    // High-engagement users
    const highEngagementUsers = userEventCounts.filter(
      (u) => u.eventCount > 20
    );
    if (highEngagementUsers.length > 0) {
      patterns.push({
        pattern: "high_engagement",
        confidence: Math.min(
          100,
          (highEngagementUsers.length / userEventCounts.length) * 100
        ),
        description: `${highEngagementUsers.length} users show high engagement (>20 events)`,
      });

      segments.push({
        name: "High Engagement Users",
        criteria: "Users with >20 events",
        userCount: highEngagementUsers.length,
      });
    }

    // Power users (diverse event types)
    const powerUsers = userEventCounts.filter((u) => u.uniqueEvents > 5);
    if (powerUsers.length > 0) {
      patterns.push({
        pattern: "power_users",
        confidence: Math.min(
          100,
          (powerUsers.length / userEventCounts.length) * 100
        ),
        description: `${powerUsers.length} users are power users (>5 different event types)`,
      });

      segments.push({
        name: "Power Users",
        criteria: "Users with >5 different event types",
        userCount: powerUsers.length,
      });
    }

    // Inactive users
    const inactiveUsers = userEventCounts.filter((u) => u.eventCount < 3);
    if (inactiveUsers.length > 0) {
      patterns.push({
        pattern: "low_engagement",
        confidence: Math.min(
          100,
          (inactiveUsers.length / userEventCounts.length) * 100
        ),
        description: `${inactiveUsers.length} users show low engagement (<3 events)`,
      });

      segments.push({
        name: "Low Engagement Users",
        criteria: "Users with <3 events",
        userCount: inactiveUsers.length,
      });
    }

    return { patterns, segments };
  }

  /**
   * Suggest optimizations based on data analysis
   */
  static generateOptimizationSuggestions(
    events: PostHogEvent[],
    insights: PostHogInsight[]
  ): Array<{
    category: string;
    priority: "high" | "medium" | "low";
    suggestion: string;
    expectedImpact: string;
  }> {
    const suggestions: Array<{
      category: string;
      priority: "high" | "medium" | "low";
      suggestion: string;
      expectedImpact: string;
    }> = [];

    const eventGroups = _.groupBy(events, "event");
    const userGroups = _.groupBy(events, "distinct_id");

    // Check for drop-off points
    const conversionEvents = ["signup", "login", "purchase", "subscription"];
    const funnelEvents = conversionEvents.filter((event) => eventGroups[event]);

    if (funnelEvents.length > 1) {
      const funnelCounts = funnelEvents.map((event) => ({
        event,
        count: eventGroups[event].length,
        users: new Set(eventGroups[event].map((e) => e.distinct_id)).size,
      }));

      for (let i = 1; i < funnelCounts.length; i++) {
        const conversionRate =
          (funnelCounts[i].users / funnelCounts[i - 1].users) * 100;
        if (conversionRate < 50) {
          suggestions.push({
            category: "Conversion Optimization",
            priority: "high",
            suggestion: `Improve conversion from ${funnelCounts[i - 1].event} to ${funnelCounts[i].event} (currently ${conversionRate.toFixed(1)}%)`,
            expectedImpact: "Could increase overall conversion by 15-30%",
          });
        }
      }
    }

    // Check for user engagement opportunities
    const avgEventsPerUser = events.length / Object.keys(userGroups).length;
    if (avgEventsPerUser < 5) {
      suggestions.push({
        category: "User Engagement",
        priority: "medium",
        suggestion: "Implement onboarding flow to increase user engagement",
        expectedImpact: "Could double average events per user",
      });
    }

    // Check for feature adoption
    if (insights.length < 5) {
      suggestions.push({
        category: "Analytics Maturity",
        priority: "medium",
        suggestion: "Create more insights to better understand user behavior",
        expectedImpact: "Improved data-driven decision making",
      });
    }

    return suggestions;
  }

  private static getTimeRange(events: PostHogEvent[]): string {
    if (events.length === 0) return "N/A";

    const sortedEvents = events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const startDate = parseISO(sortedEvents[0].timestamp);
    const endDate = parseISO(sortedEvents[sortedEvents.length - 1].timestamp);
    const daysDiff = differenceInDays(endDate, startDate);

    if (daysDiff === 0) return "today";
    if (daysDiff === 1) return "yesterday";
    if (daysDiff < 7) return `${daysDiff} days`;
    if (daysDiff < 30) return `${Math.round(daysDiff / 7)} weeks`;
    return `${Math.round(daysDiff / 30)} months`;
  }

  private static calculateTimeSpan(events: PostHogEvent[]): number {
    if (events.length < 2) return 0;

    const sortedEvents = events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return differenceInDays(
      parseISO(sortedEvents[sortedEvents.length - 1].timestamp),
      parseISO(sortedEvents[0].timestamp)
    );
  }

  private static generateRecommendations(
    events: PostHogEvent[],
    eventGroups: Record<string, PostHogEvent[]>,
    userGroups: Record<string, PostHogEvent[]>,
    trends: Array<{
      metric: string;
      change: number;
      direction: string;
      significance: string;
    }>
  ): string[] {
    const recommendations: string[] = [];
    const totalEvents = events.length;
    const totalUsers = Object.keys(userGroups).length;

    // Event volume recommendations
    if (totalEvents < 1000) {
      recommendations.push(
        "Consider implementing more tracking to capture additional user interactions"
      );
    }

    // User engagement recommendations
    const avgEventsPerUser = totalEvents / totalUsers;
    if (avgEventsPerUser < 5) {
      recommendations.push(
        "Focus on user onboarding to increase engagement and event frequency"
      );
    } else if (avgEventsPerUser > 50) {
      recommendations.push(
        "High user engagement detected - consider analyzing power user behaviors for growth insights"
      );
    }

    // Event distribution recommendations
    const topEvent = Object.entries(eventGroups).sort(
      ([, a], [, b]) => b.length - a.length
    )[0];

    if (topEvent && topEvent[1].length > totalEvents * 0.5) {
      recommendations.push(
        `"${topEvent[0]}" represents majority of events - consider tracking more diverse actions`
      );
    }

    // Trend-based recommendations
    const decliningTrends = trends.filter(
      (t) => t.direction === "down" && t.significance === "high"
    );
    if (decliningTrends.length > 0) {
      recommendations.push(
        `Address declining trends in: ${decliningTrends.map((t) => t.metric).join(", ")}`
      );
    }

    const growingTrends = trends.filter(
      (t) => t.direction === "up" && t.significance === "high"
    );
    if (growingTrends.length > 0) {
      recommendations.push(
        `Capitalize on growing trends in: ${growingTrends.map((t) => t.metric).join(", ")}`
      );
    }

    // Default recommendation if no specific insights
    if (recommendations.length === 0) {
      recommendations.push(
        "Data looks healthy - continue monitoring key metrics and user behavior patterns"
      );
    }

    return recommendations;
  }
}
