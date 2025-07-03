"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"

export async function editCourse(){
    const user = await requireAdmin();

    
}