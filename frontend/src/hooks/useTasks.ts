import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type { Task, CreateTaskForm, UpdateTaskForm, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

const TASKS_KEY = ['tasks'];

async function fetchTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<ApiResponse<Task[]>>('/tasks');
  return data.data;
}

async function createTask(form: CreateTaskForm): Promise<Task> {
  const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', form);
  return data.data;
}

async function updateTask({ id, form }: { id: string; form: UpdateTaskForm }): Promise<Task> {
  const { data } = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, form);
  return data.data;
}

async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

async function completeTask(id: string): Promise<Task> {
  const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
  return data.data;
}

export function useTasks() {
  const qc = useQueryClient();

  const tasksQuery = useQuery({ queryKey: TASKS_KEY, queryFn: fetchTasks });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: TASKS_KEY }); toast.success('Task created'); },
    onError: () => toast.error('Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: TASKS_KEY }); toast.success('Task updated'); },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: TASKS_KEY }); toast.success('Task deleted'); },
    onError: () => toast.error('Failed to delete task'),
  });

  const completeMutation = useMutation({
    mutationFn: completeTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: TASKS_KEY }); toast.success('Task marked complete'); },
  });

  return {
    tasks:     tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error:     tasksQuery.error,
    createTask:   createMutation.mutateAsync,
    updateTask:   (id: string, form: UpdateTaskForm) => updateMutation.mutateAsync({ id, form }),
    deleteTask:   deleteMutation.mutateAsync,
    completeTask: completeMutation.mutateAsync,
  };
}
