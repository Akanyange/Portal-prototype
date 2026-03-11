"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/lib/toast"
import { ProjectForm } from "@/components/project-form"

export default function CreateProjectPage() {
  const router = useRouter()

  function handleSave() {
    toast("Project created", "Your project has been saved successfully.")
    router.push("/projects")
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>•</span>
        <span className="text-foreground font-medium">Create New Project</span>
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-bold text-center tracking-tight">New Project</h1>

      <ProjectForm
        mode="create"
        onSave={handleSave}
        onCancel={() => router.push("/projects")}
      />
    </div>
  )
}
