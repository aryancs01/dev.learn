"use client"
import { Button } from "@/components/ui/button"
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { toast } from "sonner";
import { enrollInCourseAction } from "../action";
import { Loader2 } from "lucide-react";

 
export function EnrollmentButton({courseId}:{courseId:string}){
    const [isPending,startTransition] = useTransition();

    function onSubmit() {
        startTransition(async ()=>{
            const { data: result, error } = await tryCatch(enrollInCourseAction(courseId))
    
            if(error) {
                toast.error("An unexpected error occured. Please try again")
                return;
            }
    
            if(result.status === "success"){
                toast.success(result.message)
            } else if(result.status === "error"){
                toast.error(result.message)
                return;
            }
        })
      }

    return <Button onClick={onSubmit} disabled={isPending} className="w-full">
        {isPending ? (
            <>
                <Loader2 className="size-4 animate-spin"/>
                Loading ... 
            </>
        ) : (
            "Enroll Now"
        )}
    </Button>
}