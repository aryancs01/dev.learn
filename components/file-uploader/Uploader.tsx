"use client"
import { useCallback, useEffect, useState } from 'react'
import {FileRejection, useDropzone} from 'react-dropzone'
import { Card, CardContent } from '../ui/card'
import { cn } from '@/lib/utils'
import { RenderEmptyState, RenderErrorState, RenderUploadingState, RenderUploadState } from './RenderState'
import { toast } from 'sonner'
import {v4 as uuidv4} from "uuid"
import { useConstructUrl } from '@/hooks/use-construct-url'

interface UploaderState {
    id: string | null;
    file: File | null;
    uploading: boolean;
    progress: number;
    key?: string;
    isDeleting: boolean;
    error: boolean;
    objectUrl?: string;
    fileType: "image" | "video"
}

interface iAppProps {
    value?:string;
    onChange?:(value:string)=>void;
    fileTypeAccepted: "image" | "video"
}

export function Uploader({onChange,value,fileTypeAccepted}:iAppProps){

    const fileUrl = useConstructUrl(value || "");

    const [fileState,setFilesState] = useState<UploaderState>({
        error:false,
        file:null,
        id:null,
        uploading:false,
        progress:0,
        isDeleting:false,
        fileType:fileTypeAccepted,
        key:value,
        objectUrl: value ? fileUrl : undefined
    })

    const uploadFile = useCallback(
        async(file:File)=>{
                setFilesState((prev) => ({
                ...prev,
                uploading: true,
                progress:0
            }))

            try {
                const presignedResponse = await fetch("/api/s3/upload",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body: JSON.stringify({
                        fileName:file.name,
                        contentType:file.type,
                        size:file.size,
                        isImage: fileTypeAccepted === "image" ? true : false
                    })
                })

                if(!presignedResponse.ok){
                    toast.error("Failed to get presigned url")
                    setFilesState((prev) => ({
                        ...prev,
                        uploading: false,
                        progress:0,
                        error:true
                    }))

                    return;
                }

                const { presignedUrl,key } = await presignedResponse.json()

                await new Promise<void>((resolve,reject)=>{
                    const xhr = new XMLHttpRequest()

                    xhr.upload.onprogress = (event) => {
                        if(event.lengthComputable){
                            const percentageCompleted = (event.loaded / event.total)*100
                            setFilesState((prev) => ({
                                ...prev,
                                progress:Math.round(percentageCompleted),
                            }))
                        }
                    }

                    xhr.onload = () => {
                        if(xhr.status === 200 || xhr.status === 204){
                            setFilesState((prev) => ({
                                ...prev,
                                progress:100,
                                uploading:false,
                                key:key
                            }));
                            
                            onChange?.(key);

                            toast.success("File uploaded successfully")

                            resolve()
                        }else{
                            reject(new Error(`Upload failed`))
                        }
                    }

                    xhr.onerror = ()=>{
                        reject(new Error(`Upload failed`))
                    }

                    xhr.open('PUT',presignedUrl)
                    xhr.setRequestHeader('Content-Type',file.type);
                    xhr.send(file)
                })

            }catch{ 
                toast.error('Something went wrong')
                
                setFilesState((prev) => ({
                    ...prev,
                    progress:0,
                    error:true,
                    uploading:false
                }))
            }
        },
        [fileTypeAccepted, onChange]
    )

    const onDrop = useCallback((acceptedFiles:File[]) => {
        if(acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            if(fileState.objectUrl && !fileState.objectUrl.startsWith("http")){
                URL.revokeObjectURL(fileState.objectUrl)
            }

            setFilesState({
                file:file,
                uploading:false,
                progress:0,
                objectUrl:URL.createObjectURL(file),
                error:false,
                id:uuidv4(),
                isDeleting:false,
                fileType:fileTypeAccepted
            })
            uploadFile(file)
        }
    }, [fileState.objectUrl, uploadFile, fileTypeAccepted])  

    async function handleRemoveFile() {
        if(fileState.isDeleting || !fileState.objectUrl) return;

        try{
            setFilesState((prev) => ({
                ...prev,
                isDeleting:true
             }))

            const response = await fetch('/api/s3/delete',{
                method:"DELETE",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({key:fileState.key})
            })

            if(!response.ok){
                toast.error("Failed to remove file from storage")
                setFilesState((prev) => ({
                    ...prev,
                    isDeleting:true,
                    error:true
                }))

                return;
            }

            if(fileState.objectUrl && !fileState.objectUrl.startsWith("http")){
                URL.revokeObjectURL(fileState.objectUrl)
            }

            onChange?.("");

            setFilesState(() => ({
                file:null,
                uploading:false,
                progress:0,
                objectUrl:undefined,
                error:false,
                fileType:fileTypeAccepted,
                id:null,
                isDeleting:false
            }))

            toast.success("File Deleted Successfully")
        }catch{
            toast.error("Failed to remove file from storage")
            setFilesState((prev) => ({
                ...prev,
                isDeleting:false,
                error:true
            }))
        }
    }

    function rejectedFIles(fileRejection:FileRejection[]){
        if(fileRejection.length){
            const tooManyFiles = fileRejection.find((rejection)=>rejection.errors[0].code === 'too-many-files')

            const fileSizeTooBig = fileRejection.find((rejection)=> rejection.errors[0].code === "file-too-large")

            if(tooManyFiles){
                toast.error("Too many files selected, max is 1")
            }

            if(fileSizeTooBig){
                toast.error('File size exceed limit')
            }
        }
    }

    function renderContent(){
        if(fileState.uploading){
            return <RenderUploadingState progress={fileState.progress} file={fileState.file as File}/>
        }

        if(fileState.error){
            return <RenderErrorState/>
        }

        if(fileState.objectUrl){
            return <RenderUploadState 
                    handleRemoveFile={handleRemoveFile}
                    isDeleting={fileState.isDeleting}
                    previewUrl={fileState.objectUrl}
                    fileType={fileState.fileType}
                    />
        }

        return <RenderEmptyState isDragActive/>
    }

    useEffect(()=>{
        return ()=>{
            if(fileState.objectUrl && !fileState.objectUrl.startsWith("http")){
                URL.revokeObjectURL(fileState.objectUrl)
            }
        }
    },[fileState.objectUrl])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept:fileTypeAccepted === "image" ? {"image/*":[]} : {'video/*':[]},
        maxFiles:1,
        multiple:false,
        maxSize:fileTypeAccepted === "image" ? 5*1024*1024 : 500*1024*1024, // 5mb
        onDropRejected:rejectedFIles,
        disabled:fileState.uploading || !!fileState.objectUrl
    })

    return (
    <Card {...getRootProps()} className={cn(
        "relative border-2 border-dashed transition-colors duration-100 w-full h-64",
        isDragActive 
            ? "border-primary bg-primary/10 border-solid"
            : "border-border hover:border-primary"
    )}>
      <CardContent className='flex items-center justify-center h-full w-full p-4'>
        <input {...getInputProps()} />
      {
        renderContent()
      }
      </CardContent>
    </Card>
  )
}