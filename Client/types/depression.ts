// client/lib/src/types/depression.ts

export interface DepressionScale {
  scaleId: number;
  scaleName: string;
  scaleDescription: string;
  questions: string;
  severityRanges: string;
  // TODO: 量表结构等
  [key: string]: unknown;
}

export interface DepressionAssessment {
  assessmentId?: number;
  userId?: number;
  scaleId?: number;
  // score?: number;
  totalScore: number;
  createdAt?: string;
  updatedAt?: string;
  // TODO: 题目答案等
  [key: string]: unknown;
}
