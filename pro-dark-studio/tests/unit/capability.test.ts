import { checkNodeCapabilities } from '@/lib/capability';
import { NodeRegistryEntry, RobotSpec } from '@/types/core';

describe('checkNodeCapabilities', () => {
  const robot: RobotSpec = {
    id: 'test-robot',
    type: 'AGV',
    capabilities: ['carry', 'slam_nav'],
  };

  it('should enable node if all required capabilities are present', () => {
    const node: NodeRegistryEntry = {
      nodeId: 'test-node',
      type: 'action',
      title: 'Test Node',
      required: ['carry', 'slam_nav'],
    };
    const result = checkNodeCapabilities(node, robot);
    expect(result.enabled).toBe(true);
  });

  it('should disable node if any required capability is missing', () => {
    const node: NodeRegistryEntry = {
      nodeId: 'test-node',
      type: 'action',
      title: 'Test Node',
      required: ['carry', 'sprayer_nozzle'],
    };
    const result = checkNodeCapabilities(node, robot);
    expect(result.enabled).toBe(false);
    expect(result.reason).toBe('missing_caps');
    expect(result.details?.missing).toContain('sprayer_nozzle');
  });

  it('should enable node if one of the OR capabilities is present', () => {
    const node: NodeRegistryEntry = {
        nodeId: 'test-node',
        type: 'action',
        title: 'Test Node',
        required: ['sprayer_nozzle|slam_nav'],
    };
    const result = checkNodeCapabilities(node, robot);
    expect(result.enabled).toBe(true);
  });
});
