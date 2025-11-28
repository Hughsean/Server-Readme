// client/lib/src/types/admin.ts

// 精确枚举映射后端 dev.x.detector.* 枚举，不再允许额外字符串取值
export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS' | 'UNKNOWN';
export type Polarity = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED' | 'UNKNOWN';
export type Intent =
    | 'HELP_SEEKING'           // 求助意图
    | 'VENTING'                // 情绪宣泄
    | 'INFO_QUERY'             // 信息查询
    | 'NARRATIVE'              // 叙事讲述
    | 'JOKE_SARCASM'           // 玩笑讽刺
    | 'CRISIS_SELF_HARM'       // 危机/自伤自杀倾向
    | 'CLARIFICATION_REQUEST'  // 澄清请求
    | 'FOLLOW_UP_QUESTION'     // 跟进问题
    | 'OPINION'                // 观点表达
    | 'TOXIC_ABUSE'            // 辱骂/有害言论
    | 'UNKNOWN';               // 未知
export type Target = 'SELF' | 'OTHER_INDIVIDUAL' | 'GROUP_ORG' | 'UNKNOWN';

export interface AdminConversationMessage {
    id?: number;
    role?: string; // user|assistant|system|risk_detector
    messageType?: string; // text|risk_note|image|event
    text?: string | null;
    createdAt?: string; // ISO 时间
    [k: string]: unknown;
}

export interface AdminRiskMessageDetection {
    id?: number;
    messageId?: number;
    riskLevel?: RiskLevel;
    polarity?: Polarity;
    intent?: Intent;
    target?: Target;
    confidence?: number;
    evidence?: string[];
    reason?: string; // LLM 判断理由
    detectedAt?: string; // ISO 时间
    processed?: boolean; // 是否已处理
    processNotes?: string | null; // 处理备注
    [k: string]: unknown;
}

// 管理员处理风险检测结果请求体
export interface ProcessRiskDetectionPayload {
    processed: boolean;
    processNotes?: string | null;
}

export interface AdminRiskConversation {
    conversationId: number;
    userId: number;
    title?: string | null;
    createdAt?: string; // ISO 时间
    aggregatedRiskLevel?: RiskLevel;
    detections: AdminRiskMessageDetection[];
    messages: AdminConversationMessage[];
    [k: string]: unknown;
}
