import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { projects, STATUS_BADGE, STATUS_LABEL } from "@/lib/projects-data"

export function ProjectsTable() {
  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[260px] font-semibold text-foreground">Project Name</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">PE</TableHead>
            <TableHead className="font-semibold text-foreground">Tribe</TableHead>
            <TableHead className="font-semibold text-foreground">Start</TableHead>
            <TableHead className="font-semibold text-foreground">End</TableHead>
            <TableHead className="w-[160px] font-semibold text-foreground">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="cursor-pointer hover:bg-muted/30">
              {/* Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    T
                  </div>
                  <span className="font-medium text-sm">{project.name}</span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[project.status]}`}>
                  {STATUS_LABEL[project.status]}
                </span>
              </TableCell>

              {/* PE */}
              <TableCell className="text-sm text-muted-foreground">{project.pe}</TableCell>

              {/* Tribe */}
              <TableCell className="text-sm text-muted-foreground">{project.tribe}</TableCell>

              {/* Start */}
              <TableCell className="text-sm text-muted-foreground">{project.startDate}</TableCell>

              {/* End */}
              <TableCell className="text-sm text-muted-foreground">{project.endDate}</TableCell>

              {/* Progress */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{project.progress}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
