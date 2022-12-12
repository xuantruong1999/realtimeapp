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
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Group",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", MessageSchema);

const PrivateMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
  },
  { timestamps: true }
);
const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);

module.exports = { Group, Message, PrivateMessage };
