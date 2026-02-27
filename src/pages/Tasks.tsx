import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, CheckSquare, Filter } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Tables<"tasks">[]>([]);
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterProject, setFilterProject] = useState("all");

  const fetchData = async () => {
    if (!user) return;
    const [t, p] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", user.id).order("name"),
    ]);
    setTasks(t.data || []);
    setProjects(p.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async () => {
    if (!user || !title.trim() || !projectId) return;
    const { error } = await supabase.from("tasks").insert({
      title, project_id: projectId, user_id: user.id,
      due_date: dueDate || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Task created"); setOpen(false); setTitle(""); setDueDate(""); setProjectId(""); fetchData(); }
  };

  const toggleStatus = async (task: Tables<"tasks">) => {
    const newStatus = task.status === "todo" ? "completed" : "todo";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    toast.success("Task deleted"); fetchData();
  };

  const filtered = filterProject === "all" ? tasks : tasks.filter((t) => t.project_id === filterProject);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center gap-2">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-1 h-3.5 w-3.5" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" /></div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                <Button onClick={handleCreate} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CheckSquare className="mb-2 h-10 w-10" />
          <p>No tasks yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card key={task.id} className={`transition-opacity ${task.status === "completed" ? "opacity-60" : ""}`}>
              <CardContent className="flex items-center gap-3 p-3">
                <Checkbox checked={task.status === "completed"} onCheckedChange={() => toggleStatus(task)} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {projectMap[task.project_id] && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: projectMap[task.project_id].color }} />
                        {projectMap[task.project_id].name}
                      </span>
                    )}
                    {task.due_date && <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
