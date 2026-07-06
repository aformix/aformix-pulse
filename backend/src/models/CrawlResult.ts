import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILink {
  href: string;
  text: string;
  isInternal: boolean;
}

export interface ICrawlResult extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  wordCount: number;
  links: ILink[];
  loadTimeMs: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    href: { type: String, required: true },
    text: { type: String, default: '' },
    isInternal: { type: Boolean, required: true },
  },
  { _id: false }
);

const CrawlResultSchema = new Schema<ICrawlResult>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    h1Count: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    links: {
      type: [LinkSchema],
      default: [],
    },
    loadTimeMs: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICrawlResult>('CrawlResult', CrawlResultSchema);
