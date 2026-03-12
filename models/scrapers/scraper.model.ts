import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScraper extends Document {
  userId: Types.ObjectId;
  linkdeinScrapedUrl: string;
  scrapedData: any;
  scrapedAt: Date;
}

const ScraperSchema: Schema = new Schema<IScraper>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "TruCvUser",
    required: true,
  },
  linkdeinScrapedUrl: {
    type: String,
    required: true,
  },
  scrapedData: {
    type: Object,
    required: true,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
});

const Scraper = mongoose.model<IScraper>("Scraper", ScraperSchema);
export default Scraper;
