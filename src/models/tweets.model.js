import { Schema } from "mongoose";

const tweetsSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Tweet = model("Tweet", tweetsSchema);
