import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Role } from "src/auth/decorators/role.decorator";

@Schema()
export class Log  {

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }] })
    username:  mongoose.Types.ObjectId; // Username provided during the attempt

    @Prop({ required: true })
    role?: Role; // The role (optional for failed attempts)

    @Prop({ required: true })
    action: string; // Example: "Login Successful", "Login Failed"

    @Prop({ required: true })
    success: boolean; // Whether the attempt was successful

    @Prop({ default: new Date() })
    timestamp: Date; // Automatically records the time of the event
}

export const LogSchema = SchemaFactory.createForClass(Log);
