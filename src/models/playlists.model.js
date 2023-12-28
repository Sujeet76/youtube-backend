import { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        required: [true, "Video reference is required"],
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner reference is required"],
    },
  },
  { timestamps: true }
);
