import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProfilePictureNullableMigration1742153138409
  implements MigrationInterface
{
  name = 'FixProfilePictureNullableMigration1742153138409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "profile_picture" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "profile_picture" SET NOT NULL`,
    );
  }
}
