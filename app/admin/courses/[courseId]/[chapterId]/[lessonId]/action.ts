"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import { prisma } from "@/lib/db"
import { ApiResponse } from "@/lib/types"
import { LessonSchemaType, lessonsSchema } from "@/lib/zodSchemas"
import { title } from "process"

export async function updateLesson(values: LessonSchemaType, lessonId: string): Promise<ApiResponse> {
    await requireAdmin()

    try {
        const result = lessonsSchema.safeParse(values);

        if(!result.success){
            return {
                status: "error",
                message: "Invalid Data"
            }
        }

        await prisma.lesson.update({
            where: {
                id:lessonId
            },
            data: {
                title: result.data.name,
                description: result.data.description,
                thumbnailKey: result.data.thumbnailKey,
                videoKey: result.data.videoKey
            }
        });

        return {
            status: "success",
            message: "Course updated successfully"
        }
    }catch {
        return {
            status: "error",
            message: "Failed to upload course"
        }
    }
}