import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPipelines, fetchPipeline, createPipeline, updatePipeline, deletePipeline,
  fetchAgents, fetchAgent, createAgent, updateAgent, deleteAgent,
  fetchJournal, executePipeline,
} from '../lib/api';
import adapter from '../adapters';

export function usePipelines() {
  return useQuery({ queryKey: ['pipelines'], queryFn: fetchPipelines });
}

export function usePipeline(id) {
  return useQuery({ queryKey: ['pipeline', id], queryFn: () => fetchPipeline(id), enabled: !!id });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useUpdatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updatePipeline(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useAgents() {
  return useQuery({ queryKey: ['agents'], queryFn: fetchAgents });
}

export function useAgent(id) {
  return useQuery({ queryKey: ['agent', id], queryFn: () => fetchAgent(id), enabled: !!id });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateAgent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useJournal(pipelineId) {
  return useQuery({
    queryKey: ['journal', pipelineId],
    queryFn: () => fetchJournal(pipelineId),
    refetchInterval: 10000,
  });
}

export function useExecutePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, context }) => executePipeline(pipelineId, context),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] });
      qc.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useVaultBalance(address) {
  return useQuery({
    queryKey: ['vaultBalance', address],
    queryFn: () => adapter.getVaultBalance(address),
    enabled: !!address,
    refetchInterval: 60000,
  });
}
