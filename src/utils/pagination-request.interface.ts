import { Request } from 'express';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';

export interface PaginationRequest extends Request {
  pagination?: PaginationQueryDTO;
}
