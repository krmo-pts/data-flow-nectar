
import React, { memo } from 'react';
import { Database, BarChart3, Cloud, Server } from 'lucide-react';

// Memoize icon components to prevent re-renders
const PlatformIcons = {
  database: memo(() => <Database className="h-4 w-4" />),
  chart: memo(() => <BarChart3 className="h-4 w-4" />),
  cloud: memo(() => <Cloud className="h-4 w-4" />),
  server: memo(() => <Server className="h-4 w-4" />)
};

interface PlatformIconProps {
  platform: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform }) => {
  switch (platform) {
    case 'postgres':
    case 'oracle':
    case 'mysql':
    case 'snowflake':
      return <PlatformIcons.database />;
    case 'tableau':
    case 'powerbi':
    case 'looker':
      return <PlatformIcons.chart />;
    case 'azure':
    case 'aws':
    case 'gcp':
      return <PlatformIcons.cloud />;
    default:
      return <PlatformIcons.server />;
  }
};

export default memo(PlatformIcon);
