
import apiClient from './client';

export interface ResourceSummary {
  totalAllocated: number;
  averageCost: number;
  projectsWithResources: number;
}

export const resourceSummaryService = {
  async getResourcesSummary(): Promise<ResourceSummary> {
    try {
      const response = await apiClient.get('/resources/summary');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching resources summary:', error);
      // Return default values in case of error
      return {
        totalAllocated: 0,
        averageCost: 0,
        projectsWithResources: 0
      };
    }
  }
};
