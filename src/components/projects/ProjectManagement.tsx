
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from '@/data/types';
import { useUpdateProject, useDeleteProject } from '@/hooks/api/useProjects';
import { formatDate, getProjectStatusColor, formatProjectStatus } from '@/utils/financialUtils';
import { toast } from "@/hooks/use-toast";

interface ProjectManagementProps {
  project: Project;
  onProjectUpdated: () => void;
}

interface Task {
  id: string;
  title: string;
  status: 'to-do' | 'in-progress' | 'completed' | 'blocked';
  description?: string;
  assignedTo?: string;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ project, onProjectUpdated }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>(project);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    status: 'to-do',
    description: '',
  });
  
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  
  const handleEditProject = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: editedProject
      });
      
      setIsEditDialogOpen(false);
      onProjectUpdated();
      toast({
        title: "Project updated",
        description: "The project has been updated successfully"
      });
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the project",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteProject = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      
      setIsDeleteDialogOpen(false);
      onProjectUpdated();
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the project",
        variant: "destructive"
      });
    }
  };
  
  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please provide a title for the task",
        variant: "destructive"
      });
      return;
    }
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || '',
      status: newTask.status as 'to-do' | 'in-progress' | 'completed' | 'blocked',
      description: newTask.description,
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      status: 'to-do',
      description: '',
    });
    
    toast({
      title: "Task added",
      description: "New task has been added to the project"
    });
  };
  
  const handleUpdateTaskStatus = (taskId: string, newStatus: 'to-do' | 'in-progress' | 'completed' | 'blocked') => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks);
  };
  
  const getTaskStatusClass = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Management</h2>
        <div className="space-x-2">
          {/* Edit Project Button */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Make changes to the project details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editedProject.name || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editedProject.status || ''}
                    onValueChange={(value) => setEditedProject({ ...editedProject, status: value as any })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editedProject.startDate ? editedProject.startDate.slice(0, 10) : ''}
                    onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editedProject.endDate ? editedProject.endDate.slice(0, 10) : ''}
                    onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right">
                    Budget (₹)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={editedProject.budget || 0}
                    onChange={(e) => setEditedProject({ ...editedProject, budget: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditProject}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Project Button */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project
                  and all associated data including payments, expenses, and resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="bg-gray-50 pb-2">
            <CardTitle className="text-base">To Do</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {tasks.filter(t => t.status === 'to-do').map(task => (
              <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-100 mb-2 hover:shadow-sm transition-shadow">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${getTaskStatusClass(task.status)}`}>To Do</span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleUpdateTaskStatus(task.id, value as any)}
                  >
                    <SelectTrigger className="h-7 w-7 p-0 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-blue-50 pb-2">
            <CardTitle className="text-base">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <div key={task.id} className="bg-white p-3 rounded-lg border border-blue-100 mb-2 hover:shadow-sm transition-shadow">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">In Progress</span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleUpdateTaskStatus(task.id, value as any)}
                  >
                    <SelectTrigger className="h-7 w-7 p-0 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-green-50 pb-2">
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <div key={task.id} className="bg-white p-3 rounded-lg border border-green-100 mb-2 hover:shadow-sm transition-shadow">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Completed</span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleUpdateTaskStatus(task.id, value as any)}
                  >
                    <SelectTrigger className="h-7 w-7 p-0 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-red-50 pb-2">
            <CardTitle className="text-base">Blocked</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {tasks.filter(t => t.status === 'blocked').map(task => (
              <div key={task.id} className="bg-white p-3 rounded-lg border border-red-100 mb-2 hover:shadow-sm transition-shadow">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">Blocked</span>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleUpdateTaskStatus(task.id, value as any)}
                  >
                    <SelectTrigger className="h-7 w-7 p-0 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Add new task form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add New Task</CardTitle>
          <CardDescription>
            Create a new task for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-title" className="text-right">
                Title
              </Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
                placeholder="Task title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-status" className="text-right">
                Status
              </Label>
              <Select
                value={newTask.status}
                onValueChange={(value) => setNewTask({ ...newTask, status: value as any })}
              >
                <SelectTrigger id="task-status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-do">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardFooter>
      </Card>
      
      {/* Current Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-1 rounded ${getProjectStatusColor(project.status)}`}>
                  {formatProjectStatus(project.status)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(project.startDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectManagement;
