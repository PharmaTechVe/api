import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchColumnInLotMigration1745985305444
  implements MigrationInterface
{
  name = 'AddBranchColumnInLotMigration1745985305444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lot" ADD "branch_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD CONSTRAINT "FK_7d53454b93e35a08f430262da15" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lot" DROP CONSTRAINT "FK_7d53454b93e35a08f430262da15"`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "branch_id"`);
  }
}
