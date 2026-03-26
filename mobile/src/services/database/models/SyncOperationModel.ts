import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export class SyncOperationModel extends Model {
  static table = 'sync_operations';

  @field('entity_type') entityType!: string;
  @field('entity_id') entityId!: string;
  @field('operation') operation!: string;
  @field('payload') payload!: string;
  @field('created_at') createdAt!: number;
  @field('retry_count') retryCount!: number;
  @field('status') status!: string;
  @field('idempotency_key') idempotencyKey!: string;
}
