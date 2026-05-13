
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  LogOut, 
  Sparkles, 
  Calendar, 
  MoreVertical, 
  Search,
  CheckCircle,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { suggestTaskDescription } from "@/ai/flows/ai-task-description-suggester";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  isCompleted: boolean;
  createdAt: Timestamp;
  userId: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Task form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const emptyImage = PlaceHolderImages.find(img => img.id === 'empty-tasks');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleAiSuggest = async () => {
    if (!title) {
      toast({ variant: "destructive", title: "Wait!", description: "Enter a task title first to get AI suggestions." });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestTaskDescription({ title });
      setDescription(result.description);
      toast({ title: "AI Suggestion applied", description: "Expanded your task description." });
    } catch (err) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to fetch AI suggestions." });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setIsEditing(true);
      setCurrentTaskId(task.id);
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate);
    } else {
      setIsEditing(false);
      setCurrentTaskId(null);
      setTitle("");
      setDescription("");
      setPriority('medium');
      setDueDate(format(new Date(), "yyyy-MM-dd"));
    }
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      if (isEditing && currentTaskId) {
        await updateDoc(doc(db, "tasks", currentTaskId), {
          title,
          description,
          priority,
          dueDate,
        });
        toast({ title: "Task updated", description: "Successfully updated your task." });
      } else {
        await addDoc(collection(db, "tasks"), {
          title,
          description,
          priority,
          dueDate,
          isCompleted: false,
          createdAt: serverTimestamp(),
          userId: user.uid
        });
        toast({ title: "Task created", description: "Your new task has been added." });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        isCompleted: !task.isCompleted
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast({ title: "Task deleted", description: "Task removed from your list." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Clock className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 lg:px-8 h-16 flex items-center border-b bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight text-primary">PrimeTaskManager</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="hidden sm:inline-block text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl py-8 px-4 mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your personal goals and daily tasks.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg h-11 px-6 rounded-full font-semibold gap-2">
            <Plus className="h-5 w-5" /> New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar / Stats */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total</span>
                  <span className="font-bold">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <span className="font-bold text-accent">{tasks.filter(t => t.isCompleted).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <span className="font-bold text-primary">{tasks.filter(t => !t.isCompleted).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task List Section */}
          <div className="md:col-span-3 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
                placeholder="Search tasks by title or description..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className={`group border-none shadow-sm transition-all hover:shadow-md ${task.isCompleted ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <button 
                        onClick={() => toggleComplete(task)}
                        className="mt-1 flex-shrink-0 transition-colors"
                      >
                        {task.isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-accent" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold truncate text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          <Badge variant="outline" className={`capitalize font-medium text-[10px] py-0 px-2 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                          {task.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenModal(task)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-primary/20 text-center space-y-4">
                {emptyImage && (
                  <Image 
                    src={emptyImage.imageUrl} 
                    alt="Empty tasks" 
                    width={200} 
                    height={150} 
                    className="opacity-50 grayscale"
                  />
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-headline font-semibold">No tasks found</h3>
                  <p className="text-muted-foreground max-w-xs">Start your productivity journey by adding your first task!</p>
                </div>
                <Button onClick={() => handleOpenModal()} variant="outline" className="rounded-full">
                  Create Task
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Task Creation/Editing Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden">
          <form onSubmit={handleSubmitTask}>
            <DialogHeader className="p-6 bg-primary/5 border-b">
              <DialogTitle className="text-2xl font-headline font-bold text-primary">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Weekly Grocery Run" 
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:bg-primary/10 h-8 gap-1.5 font-medium"
                    onClick={handleAiSuggest}
                    disabled={isSuggesting || !title}
                  >
                    {isSuggesting ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Suggest with AI
                  </Button>
                </div>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Provide some context for your task..." 
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Priority</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 bg-card border-t">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 h-11 font-semibold min-w-[120px]">
                {isSubmitting ? <Clock className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? 'Save Changes' : 'Create Task')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
