
import { ImpactType } from '@/types/lineage';

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'table':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'task':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'report':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'postgres':
    case 'oracle':
    case 'mysql':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'snowflake':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'tableau':
    case 'powerbi':
    case 'looker':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'azure':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'aws':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'gcp':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
