"use client"
import { signOut } from "next-auth/react"

export default function Profile() {
    return (
        <div>
            <h1> Profile</h1>
            <button
                className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                Log out
            </button>
        </div>
    )
}

// avatar