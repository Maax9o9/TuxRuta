import { Colective } from '../../data/models/colective.model';
import { Observable } from 'rxjs';

export class GetColectiveByIdUseCase {
  constructor(private repository: { getById: (id: number, token?: string) => Observable<Colective | null> }) {}

  execute(id: number, token?: string): Observable<Colective | null> {
    return this.repository.getById(id, token);
  }
}
