"use client"

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
    const router = useRouter();
    const handleSignout = async function signOut() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                    toast.success("Signout Successfully")
                },
                onError: () => {
                    toast.error('Failed to Sign out')
                }
            },
        });
    }

    return handleSignout
}