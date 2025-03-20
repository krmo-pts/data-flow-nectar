
export const getNodeTypeClass = (type: string) => {
  switch (type) {
    case 'table':
      return 'node-table';
    case 'task':
      return 'node-task';
    case 'report':
      return 'node-report';
    default:
      return '';
  }
};
