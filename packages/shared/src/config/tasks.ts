/**
 * Task configuration interface.
 * Defines the structure for task configuration objects.
 */
export interface ITaskConfig {
  /**
   * Unique identifier for the task type.
   * @description Used to identify the task in the system.
   */
  id: string;

  /**
   * Human-readable task name.
   * @description Display name shown to users.
   */
  name: string;

  /**
   * Duration of each individual loop in milliseconds.
   * @description How long each loop takes to complete.
   */
  loopDuration: number;

  /**
   * Total duration of the entire task cycle in milliseconds.
   * @description How long the entire task runs (sum of all loops).
   */
  totalDuration: number;

  /**
   * Description of what this task does.
   * @description Optional description for UI or documentation.
   */
  description?: string;

  /**
   * Rewards given per loop completion.
   * @description Items and quantities awarded for each completed loop.
   */
  rewardsPerLoop?: Record<string, number>;

  /**
   * Whether this task is currently enabled.
   * @description Allows disabling tasks without removing them.
   */
  enabled?: boolean;
}

/**
 * Task configuration registry.
 * Contains all available task configurations.
 */
export const TASK_CONFIGS: Record<string, ITaskConfig> = {
  MINE_ASTEROID: {
    id: 'mine_asteroid',
    name: 'Mine Asteroid',
    loopDuration: 20000, // 20 seconds per loop
    totalDuration: 100000, // 100 seconds total
    description: 'Extract valuable ore from asteroids',
    rewardsPerLoop: {
      iron: 1, // 1 iron ore per loop
    },
    enabled: true,
  },
  // Future tasks can be added here:
  // CRAFT_ITEM: {
  //   id: 'craft_item',
  //   name: 'Craft Item',
  //   loopDuration: 3000,
  //   totalDuration: 15000,
  //   description: 'Create useful items from raw materials',
  //   enabled: true,
  // },
};

/**
 * Gets a task configuration by its ID.
 * @param taskId - The task ID to look up.
 * @returns The task configuration or undefined if not found.
 */
export function getTaskConfig(taskId: string): ITaskConfig | undefined {
  return TASK_CONFIGS[taskId];
}

/**
 * Gets all enabled task configurations.
 * @returns Array of enabled task configurations.
 */
export function getEnabledTaskConfigs(): ITaskConfig[] {
  return Object.values(TASK_CONFIGS).filter(
    (config) => config.enabled !== false
  );
}

/**
 * Gets all task configurations.
 * @returns Array of all task configurations.
 */
export function getAllTaskConfigs(): ITaskConfig[] {
  return Object.values(TASK_CONFIGS);
}
