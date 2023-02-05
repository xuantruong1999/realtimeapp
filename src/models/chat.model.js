const mongoose = require("mongoose");
const { UserSchema } = require("./user.model");

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
const Group = mongoose.model("Group", GroupSchema);

const MessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", MessageSchema);

module.exports = { Group, Message };
