"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/lib/toast"
import { ProjectForm } from "@/components/project-form"
import { projects } from "@/lib/projects-data"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const project = projects.find(p => p.id === id)

  if (!project) {
    return (
      <div className="max-w-[640px] mx-auto py-12 text-center text-muted-foreground">
        Project not found.
      </div>
    )
  }

  const initialData = {
    name: project.name,
    description: project.description ?? "",
    status: project.status,
    startDate: "",
    endDate: "",
    tribe: project.tribe,
    pe: project.pe,
    isPublic: project.visibility === "Public",
    boardUrl: project.boardUrl === "#" ? "" : project.boardUrl,
    leadEmail: project.lead,
    milestones: [],
  }

  function handleSave() {
    toast("Project updated", "Your changes have been saved.")
    router.push(`/projects/${id}`)
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>•</span>
        <Link href={`/projects/${id}`} className="hover:text-foreground transition-colors">
          {project.name}
        </Link>
        <span>•</span>
        <span className="text-foreground font-medium">Edit</span>
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-bold text-center tracking-tight">Edit Project</h1>

      <ProjectForm
        mode="edit"
        initialData={initialData}
        projectId={id}
        onSave={handleSave}
        onCancel={() => router.push(`/projects/${id}`)}
      />
    </div>
  )
}
