import { Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "content is required"],
    },
    video: [
      {
        type: Types.ObjectId,
        ref: "Video",
        required: [true, "Video ref is required"],
        trim: true,
      },
    ],
    owner: {
      type: Types.ObjectId,
      required: [true, "user ref is required"],
    },
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
