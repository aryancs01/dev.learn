"use client"

import { AdminLessonType } from "@/app/data/admin/admin-get-lesson"
import { Uploader } from "@/components/file-uploader/Uploader";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { LessonSchemaType, lessonsSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateLesson } from "../action";
import { toast } from "sonner";

interface iAppProps {
    data: AdminLessonType;
    chapterId: string;
    courseId: string;
}

export function LessonForm({data, chapterId, courseId}: iAppProps){
    const [isPending,startTransition] = useTransition();
    const form = useForm<LessonSchemaType>({
        resolver: zodResolver(lessonsSchema),
        defaultValues: {
            name:data.title,
            chapterId: chapterId,
            courseId: courseId,
            description: data.description ?? undefined,
            videoKey:data.videoKey ?? undefined,
            thumbnailKey:data.thumbnailKey ?? undefined
        },
    });

    function onSubmit(values: LessonSchemaType) {
        startTransition(async ()=>{
            const { data: result, error } = await tryCatch(updateLesson(values, data.id))

            if(error) {
                toast.error("An unexpected error occured. Please try again")
                return;
            }

            if(result.status === "success"){
                toast.success(result.message)
            } else if(result.status === "error"){
                toast.error(result.message)
            }
        })
    }
    return (
        <div>
            <Link href={`/admin/courses/${courseId}/edit`} className={buttonVariants({variant:"outline", className:"mb-6"})}>
                <ArrowLeft className="size-4"/>
                <span>Go Back</span>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Configuration</CardTitle>
                    <CardDescription>Configure the video and description for this lesson</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Lesson Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Chapter xyz" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <RichTextEditor field={field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="thumbnailKey"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Thumbnail image</FormLabel>
                                        <FormControl>
                                            <Uploader fileTypeAccepted="image" onChange={field.onChange} value={field.value}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="videoKey"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Video File</FormLabel>
                                        <FormControl>
                                            <Uploader fileTypeAccepted="video" onChange={field.onChange} value={field.value}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button disabled={isPending} type="submit">
                                {isPending? "Saving..." : "Save Lessons"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}