import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { SectionCards } from "@/components/sidebar/section-cards";
import { adminGetEnrollmentStats } from "../data/admin/admin-get-enrollment-stats";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { adminGetRecentCourses } from "../data/admin/admin-get-recent-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { AdminCourseCard, AdminCourseCardSkelton } from "./courses/_components/AdminCourseCard";
import { Suspense } from "react";

export default async function AdminIndexPage(){
  const enrollmentData = await adminGetEnrollmentStats();
  return (
     <>
      <SectionCards />
      <ChartAreaInteractive data={enrollmentData} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          <Link className={buttonVariants({
            variant:"outline"
          })} href="/admin/courses">
            View All Courses
          </Link>
        </div> 
        <Suspense fallback={<AdminCourseCardSkeletonLayout/>}>
          <RenderRecentCourses/>
        </Suspense>
      </div>
     </>
  )
}

async function RenderRecentCourses(){
  const data = await adminGetRecentCourses();

  if(data.length === 0){
    return (
      <EmptyState 
        buttonText="Create new Course" 
        description="You dont have any courses. create some to see them here"
        title="You dont have any courses yet!"
        href="/admin/courses/create"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((course) => (
        <AdminCourseCard key={course.id} data={course}/>
      ))}
    </div>
  )
}

function AdminCourseCardSkeletonLayout(){
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
            {Array.from({length: 2}).map((_, index) => (
                <AdminCourseCardSkelton key={index}/>
            ))}
        </div>
    )
}