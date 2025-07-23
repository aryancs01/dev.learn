import "server-only"
import { requireUser } from "./require-user"
import { prisma } from "@/lib/db";

export async function getEnrollCourses(){
    const user = await requireUser();

    const data = await prisma.enrollment.findMany({
        where: {
            userId: user.id,
            status:"Active"
        },
        select:{
            Course: {
                select:{
                    id: true,
                    title:true,
                    smallDescription:true,
                    fileKey:true,
                    level:true,
                    slug:true,
                    duration:true,
                    category:true,
                    chapters:{
                        select:{
                            id:true,
                            lessons:{
                                select:{
                                    id: true,
                                    lessonProgress:{
                                        where:{
                                            userId:user.id,
                                        },
                                        select:{
                                            id:true,
                                            completed:true,
                                            lessonId:true
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            }
        }
    })

    return data;
}

export type EnrolledCourseType = Awaited<ReturnType<typeof getEnrollCourses>>[0]