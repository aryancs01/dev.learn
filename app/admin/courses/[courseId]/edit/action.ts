"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
    detectBot({
        mode: "LIVE",
        allow: []
    })
).withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
)

export async function editCourse(data: CourseSchemaType, courseId: string): Promise<ApiResponse> {
    const user = await requireAdmin();

    try {
        const req = await request()

        const decision = await aj.protect(req, {
            fingerprint: user?.user.id as string
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return {
                    status: "error",
                    message: "You have been blocked due to rate limiting"
                }
            } else {
                return {
                    status: "error",
                    message: "You are a bot, if this is a mistake contact our support"
                }
            }
        }

        const result = courseSchema.safeParse(data);

        if (!result.success) {
            return {
                status: "error",
                message: "Inavlid data"
            }
        }

        await prisma.course.update({
            where: {
                id: courseId,
                userId: user.user.id
            },
            data: {
                ...result.data
            }
        })

        return {
            status: "success",
            message: "Course updated Successfully"
        }

    } catch {
        return {
            status: "error",
            message: "Failed to update course"
        }
    }
}