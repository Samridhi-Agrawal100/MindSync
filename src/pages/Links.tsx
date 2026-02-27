import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Link2, ExternalLink, Filter } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function Links() {
  const { user } = useAuth();
  const [links, setLinks] = useState<Tables<"links">[]>([]);
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterProject, setFilterProject] = useState("all");

  const fetchData = async () => {
    if (!user) return;
    const [l, p] = await Promise.all([
      supabase.from("links").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", user.id).order("name"),
    ]);
    setLinks(l.data || []);
    setProjects(p.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCreate = async () => {
    if (!user || !url.trim() || !title.trim() || !projectId) return;
    const { error } = await supabase.from("links").insert({ url, title, description, project_id: projectId, user_id: user.id });
    if (error) toast.error(error.message);
    else { toast.success("Link saved"); setOpen(false); setUrl(""); setTitle(""); setDescription(""); setProjectId(""); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    toast.success("Link deleted"); fetchData();
  };

  const filtered = filterProject === "all" ? links : links.filter((l) => l.project_id === filterProject);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Links</h1>
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
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Save Link</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Save Link</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Link title" /></div>
                <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" /></div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Save Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Link2 className="mb-2 h-10 w-10" />
          <p>No saved links yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                    {link.title} <ExternalLink className="h-3 w-3" />
                  </a>
                  {link.description && <p className="text-xs text-muted-foreground truncate">{link.description}</p>}
                  {projectMap[link.project_id] && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: projectMap[link.project_id].color }} />
                      {projectMap[link.project_id].name}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(link.id)}>
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
