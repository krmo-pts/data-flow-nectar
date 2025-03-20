
import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImpactType } from '@/types/lineage';

interface ImpactBadgeProps {
  impactType?: ImpactType;
}

const ImpactBadge: React.FC<ImpactBadgeProps> = ({ impactType }) => {
  switch (impactType) {
    case 'direct':
      return <Badge variant="outline" className="bg-sky-100 text-sky-800 border-sky-200">Focus Node</Badge>;
    case 'upstream':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <ArrowUpCircle size={12} />
          Upstream Dependency
        </Badge>
      );
    case 'downstream':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <ArrowDownCircle size={12} />
          Downstream Dependency
        </Badge>
      );
    default:
      return null;
  }
};

export default ImpactBadge;
