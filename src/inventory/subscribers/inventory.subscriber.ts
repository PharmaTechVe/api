import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { Inventory } from '../entities/inventory.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@EventSubscriber()
export class InventorySubscriber
  implements EntitySubscriberInterface<ProductPresentation>
{
  /**
   * Este subscriber escucha únicamente para la entidad ProductPresentation.
   */
  listenTo() {
    return ProductPresentation;
  }

  /**
   * Después de insertar un nuevo ProductPresentation, se crea un registro en Inventory
   * para cada Branch con stockQuantity = 0.
   */
  async afterInsert(event: InsertEvent<ProductPresentation>): Promise<void> {
    const branchRepository = event.manager.getRepository(Branch);
    const inventoryRepository = event.manager.getRepository(Inventory);

    // Obtener todas las sucursales
    const branches = await branchRepository.find();

    await Promise.all(
      branches.map(async (branch) => {
        const newInventory = inventoryRepository.create({
          branch, // Relaciona la sucursal
          productPresentation: event.entity, // Asocia la ProductPresentation insertada
          stockQuantity: 0, // Inicializa en 0
        });
        return await inventoryRepository.save(newInventory);
      }),
    );
  }
}
