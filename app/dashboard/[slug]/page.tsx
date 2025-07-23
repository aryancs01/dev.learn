import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { redirect } from "next/navigation";

interface iAppProps {
    params: Promise<{slug: string}>;
}

export default async function CourseSlugRoute({ params }:iAppProps){
    const { slug } = await params;

    const course = await getCourseSidebarData(slug)
    const firstChapter = course.course.chapters[0]

    let firstLesson
    if(firstChapter){
        firstLesson = firstChapter.lessons[0]
    }
    if(firstLesson) {
        redirect(`/dashboard/${slug}/${firstLesson.id}`)
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">No Lessons available</h2>
            <p className="text-muted-foreground">This course does not have any lessons yet</p>
        </div>
    )
}