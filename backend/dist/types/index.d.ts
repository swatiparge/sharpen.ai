export interface User {
    id: string;
    email: string;
    full_name: string;
    created_at: Date;
}
export interface OnboardingProfile {
    id: string;
    user_id: string;
    current_role?: string;
    years_experience?: string;
    current_company?: string;
    target_level?: string;
    target_companies?: string[];
    consent_given: boolean;
    onboarding_done: boolean;
}
export type InterviewStatus = 'CREATED' | 'RECORDED' | 'TRANSCRIBING' | 'TRANSCRIBED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
export type InterviewRound = 'SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'OTHER';
export type InterviewType = 'RECORDED' | 'RECONSTRUCTED' | 'SIMULATION';
export interface Interview {
    id: string;
    user_id: string;
    name: string;
    company?: string;
    round?: InterviewRound;
    interview_type: InterviewType;
    status: InterviewStatus;
    overall_score?: number;
    summary_text?: string;
    badge_label?: string;
    interviewed_at: Date;
    created_at: Date;
}
export interface Metric {
    id: string;
    interview_id: string;
    metric_name: string;
    score?: number;
    trend?: 'UP' | 'DOWN' | 'FLAT';
    explanation_summary?: string;
}
export interface Pattern {
    id: string;
    user_id: string;
    pattern_type: 'WEAKNESS' | 'STRENGTH';
    title: string;
    description?: string;
    severity?: string;
    impact?: string;
    occurrence: number;
}
export interface TranscriptSegment {
    id: string;
    interview_id: string;
    segment_order: number;
    start_ms?: number;
    end_ms?: number;
    speaker: string;
    text: string;
    highlight?: string;
}
export interface RoadmapTask {
    id: string;
    roadmap_id: string;
    week_label?: string;
    theme?: string;
    task_text: string;
    is_done: boolean;
    order_index: number;
}
export interface SimulationSession {
    id: string;
    user_id: string;
    simulation_id: string;
    status: string;
    overall_score?: number;
    summary_text?: string;
    started_at: Date;
    completed_at?: Date;
}
export interface VocalSignals {
    wpm: number;
    filler_count: number;
    pause_stats: string;
    emotional_tone: {
        confidence_score: number;
        anxiety_score: number;
        observations: string;
    };
}
export interface TranscribeJobPayload {
    interviewId: string;
    mediaPath: string;
}
export interface AnalyzeJobPayload {
    interviewId: string;
    userId: string;
    mediaUrl?: string;
}
export interface ReconstructionAnalyzeJobPayload {
    interviewId: string;
    userId: string;
}
export interface SimulationAnalyzeJobPayload {
    sessionId: string;
    userId: string;
}
//# sourceMappingURL=index.d.ts.map