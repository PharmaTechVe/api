import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuantityColumnInLotMigration1746026372925
  implements MigrationInterface
{
  name = 'AddQuantityColumnInLotMigration1746026372925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "quantity" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "quantity"`);
  }
}
