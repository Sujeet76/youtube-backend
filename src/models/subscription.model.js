import { model } from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: [
      {
        type: Schema.Types.ObjectId, //user who subscribed
        required: [true, "User reference is required"],
        ref: "User",
      },
    ],
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel reference is required"],
    },
  },
  { timestamps: true }
);

export const Subscription = model("Subscription", subscriptionSchema);
