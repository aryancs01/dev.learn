import "server-only"
import { requireAdmin } from "./require-admin"
import { prisma } from "@/lib/db";
import { Key } from "lucide-react";
import { notFound } from "next/navigation";

export async function adminGetCourse(id:string){
    await requireAdmin();

    const data = await prisma.course.findUnique({
        where:{
            id:id
        },
        select: {
            id: true,
            title: true,
            description: true,
            fileKey: true,
            price: true,
            duration:true,
            level: true,
            status: true,
            smallDescription: true,
            category: true
        }
    });

    if(!data){
        return notFound()
    }

    return data;
}
