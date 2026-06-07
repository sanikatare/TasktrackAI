import { Schema, model, Document, Types } from 'mongoose';

interface PlanSection {
  title: string;
  duration: string;
  topics: string[];
  activities: string[];
}

export interface IAIStudyPlan extends Document {
  userId: string;
  taskId: Types.ObjectId;
  planText: string;
  breakdown: PlanSection[];
  estimatedDays: number;
  dailyGoals: string[];
  resources: string[];
  generatedAt: Date;
}

const aiStudyPlanSchema = new Schema<IAIStudyPlan>(
  {
    userId:        { type: String, required: true, index: true },
    taskId:        { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    planText:      { type: String, required: true },
    breakdown: [{
      title:      String,
      duration:   String,
      topics:     [String],
      activities: [String],
    }],
    estimatedDays: { type: Number, default: 7 },
    dailyGoals:    [String],
    resources:     [String],
    generatedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AIStudyPlan = model<IAIStudyPlan>('AIStudyPlan', aiStudyPlanSchema);
