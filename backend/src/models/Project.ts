import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProjectStatus = 'active' | 'paused' | 'archived';
export type CrawlFrequency = 'daily' | 'weekly' | 'manual';

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  domain: string;
  status: ProjectStatus;
  crawlFrequency: CrawlFrequency;
  lastCrawledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'archived'],
      default: 'active',
    },
    crawlFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'manual'],
      default: 'manual',
    },
    lastCrawledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
